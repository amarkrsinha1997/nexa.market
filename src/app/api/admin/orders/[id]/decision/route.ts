import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminRequest } from "@/lib/utils/admin-auth";
import { blockchainService } from "@/lib/services/blockchain.service";
import { nexaConfig } from "@/lib/config/nexa.config";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // 1. Verify Admin Auth
        const authResult = await verifyAdminRequest(req);
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { user: admin } = authResult;

        const body = await req.json();
        const { decision, reason } = body;
        // decision: 'APPROVE' | 'REJECT'

        if (!decision) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        const resolvedParams = await params;
        const orderId = resolvedParams.id;

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { user: true }
        });

        if (!order) {
            return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
        }

        // Validate Lock - Allow SUPERADMIN to override
        const isSuperadminOverride = order.checkedBy !== admin.id && admin.role === "SUPERADMIN";
        if (order.checkedBy !== admin.id && admin.role !== "SUPERADMIN") {
            return NextResponse.json({ success: false, message: "You are not the checking admin for this order" }, { status: 403 });
        }

        let newStatus: any = order.status;
        let txHash: string | undefined;
        let failureReason: string | null = null;

        if (decision === 'APPROVE') {
            // First set to ADMIN_APPROVED
            newStatus = 'ADMIN_APPROVED';

            // Check if user has a Nexa wallet address
            if (order.user.nexaWalletAddress) {
                // Validate address matches network
                const addressValidation = blockchainService.validateAddress(
                    order.user.nexaWalletAddress,
                    nexaConfig.network
                );

                if (addressValidation.valid && addressValidation.network === nexaConfig.network) {

                    // Check system balance before attempting transfer
                    const currentBalance = blockchainService.fundBalance;
                    if (currentBalance < order.nexaAmount) {
                        failureReason = `Insufficient balance: Required ${order.nexaAmount} NEX, Available ${currentBalance} NEX`;
                        console.warn(`[OrderDecision] ${failureReason}. Skipping auto-payment.`);
                        // Keep as ADMIN_APPROVED, cron will handle when funds added
                    } else {
                        // Process payment release
                        console.log('[OrderDecision] Processing payment release for order:', orderId);

                        try {
                            const paymentResult = await blockchainService.processFundTransfer(
                                order.user.nexaWalletAddress,
                                order.nexaAmount.toFixed(2),
                                order.user.id
                            );

                            if (paymentResult.success) {
                                // Payment successful - update to RELEASE_PAYMENT
                                newStatus = 'RELEASE_PAYMENT';
                                txHash = paymentResult.txHash;
                                failureReason = null; // Clear any previous failure reason
                                console.log('[OrderDecision] Payment released successfully:', {
                                    orderId,
                                    txHash,
                                    amount: order.nexaAmount,
                                    to: order.user.nexaWalletAddress
                                });
                            } else {
                                failureReason = `Transfer failed: ${paymentResult.error}`;
                                console.error('[OrderDecision] Payment release failed:', paymentResult.error);
                                // Keep as ADMIN_APPROVED, will be retried by cron
                            }
                        } catch (err) {
                            failureReason = `Transfer exception: ${err instanceof Error ? err.message : String(err)}`;
                            console.error('[OrderDecision] Payment release exception:', err);
                            // Keep as ADMIN_APPROVED
                        }
                    }
                } else {
                    failureReason = `Invalid wallet address: ${addressValidation.error || 'Address network mismatch'}`;
                    console.warn(`[OrderDecision] ${failureReason}`);
                    // Keep as ADMIN_APPROVED
                }
            } else {
                failureReason = 'User has no Nexa wallet address';
                console.warn(`[OrderDecision] ${failureReason}. Skipping auto-payment.`);
                // Keep as ADMIN_APPROVED
            }
        } else if (decision === 'REJECT') {
            newStatus = 'REJECTED';
        } else {
            return NextResponse.json({ success: false, message: "Invalid decision" }, { status: 400 });
        }

        // Create lifecycle events
        const currentLifecycle = (order.lifecycle as any[]) || [];
        const lifecycleEvents: any[] = [];

        // Approval event
        lifecycleEvents.push({
            status: decision === 'APPROVE' ? 'ADMIN_APPROVED' : 'REJECTED',
            timestamp: new Date().toISOString(),
            actorId: admin.id,
            actorName: admin.name,
            actorEmail: admin.email,
            actorPicture: admin.picture,
            action: decision === 'APPROVE' ? 'APPROVE' as const : 'REJECT' as const,
            note: reason || (isSuperadminOverride ? `SUPERADMIN ${decision} (override)` : `Admin ${decision}`),
            isSuperadminOverride
        });

        // Payment attempt tracking (add to lifecycle if approval)
        if (decision === 'APPROVE' && typeof failureReason !== 'undefined') {
            if (failureReason) {
                // Payment failed or skipped
                lifecycleEvents.push({
                    status: 'ADMIN_APPROVED',
                    timestamp: new Date().toISOString(),
                    actorId: 'SYSTEM',
                    actorName: 'Payment System',
                    action: 'PAYMENT_ATTEMPT_FAILED' as const,
                    note: failureReason,
                    recipientAddress: order.user.nexaWalletAddress || null
                });
            }
        }

        // Payment release event (only if approved and payment successful)
        if (newStatus === 'RELEASE_PAYMENT' && txHash) {
            lifecycleEvents.push({
                status: 'RELEASE_PAYMENT',
                timestamp: new Date().toISOString(),
                actorId: 'SYSTEM',
                actorName: 'Blockchain Service',
                action: 'RELEASE_PAYMENT' as const,
                note: `Payment released to ${order.user.nexaWalletAddress}`,
                txHash,
                recipientAddress: order.user.nexaWalletAddress
            });
        }

        // Update order in database
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: newStatus,
                nexaTransactionHash: txHash,
                lifecycle: [...currentLifecycle, ...lifecycleEvents],
                // Payment tracking fields for easier querying
                ...(decision === 'APPROVE' && {
                    paymentAttemptedAt: new Date(),
                    paymentRecipientAddress: order.user.nexaWalletAddress || null,
                    paymentFailureReason: failureReason
                })
            }
        });

        return NextResponse.json({ success: true, data: updatedOrder });

    } catch (error) {
        console.error("Order decision failed", error);
        return NextResponse.json({ success: false, message: "Internal Error" }, { status: 500 });
    }
}
