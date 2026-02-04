import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminRequest } from "@/lib/utils/admin-auth";
import { blockchainService } from "@/lib/services/blockchain.service";
import { nexaConfig } from "@/lib/config/nexa.config";
import { OrderStatus } from "@prisma/client";

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
        const resolvedParams = await params;
        const orderId = resolvedParams.id;

        // Fetch order with user data
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { user: true }
        });

        if (!order) {
            return NextResponse.json({
                success: false,
                message: "Order not found"
            }, { status: 404 });
        }

        // Validate order is in ADMIN_APPROVED status
        if (order.status !== 'ADMIN_APPROVED') {
            return NextResponse.json({
                success: false,
                message: `Cannot reprocess payment. Order status is ${order.status}`
            }, { status: 400 });
        }

        // Check if there was a previous payment failure
        if (!order.paymentFailureReason) {
            return NextResponse.json({
                success: false,
                message: "Order has no payment failure to retry"
            }, { status: 400 });
        }

        let newStatus: OrderStatus = OrderStatus.ADMIN_APPROVED;
        let txHash: string | undefined;
        let failureReason: string | null = null;

        // Check if user has wallet address
        if (!order.user.nexaWalletAddress) {
            failureReason = 'User has no Nexa wallet address';
            console.warn(`[PaymentReprocess] ${failureReason}`);
        } else {
            // Validate address
            const addressValidation = blockchainService.validateAddress(
                order.user.nexaWalletAddress,
                nexaConfig.network
            );

            if (!addressValidation.valid || addressValidation.network !== nexaConfig.network) {
                failureReason = `Invalid wallet address: ${addressValidation.error || 'Network mismatch'}`;
                console.warn(`[PaymentReprocess] ${failureReason}`);
            } else {
                // Check balance
                const currentBalance = blockchainService.fundBalance;
                if (currentBalance < order.nexaAmount) {
                    failureReason = `Insufficient balance: Required ${order.nexaAmount} NEX, Available ${currentBalance} NEX`;
                    console.warn(`[PaymentReprocess] ${failureReason}`);
                } else {
                    // Attempt payment
                    console.log('[PaymentReprocess] Processing payment for order:', orderId);

                    try {
                        const paymentResult = await blockchainService.processFundTransfer(
                            order.user.nexaWalletAddress,
                            order.nexaAmount.toFixed(2),
                            order.user.id
                        );

                        if (paymentResult.success) {
                            newStatus = OrderStatus.RELEASE_PAYMENT;
                            txHash = paymentResult.txHash;
                            failureReason = null;
                            console.log('[PaymentReprocess] Payment successful:', {
                                orderId,
                                txHash,
                                amount: order.nexaAmount
                            });
                        } else {
                            failureReason = `Transfer failed: ${paymentResult.error}`;
                            console.error('[PaymentReprocess] Payment failed:', paymentResult.error);
                        }
                    } catch (err) {
                        failureReason = `Transfer exception: ${err instanceof Error ? err.message : String(err)}`;
                        console.error('[PaymentReprocess] Exception:', err);
                    }
                }
            }
        }

        // Create lifecycle event
        const currentLifecycle = (order.lifecycle as any[]) || [];
        const lifecycleEvents: any[] = [];

        if (failureReason) {
            // Payment retry failed
            lifecycleEvents.push({
                status: 'ADMIN_APPROVED',
                timestamp: new Date().toISOString(),
                actorId: admin.id,
                actorName: admin.name,
                action: 'PAYMENT_RETRY_FAILED' as const,
                note: failureReason,
                recipientAddress: order.user.nexaWalletAddress || null
            });
        } else {
            // Payment successful
            lifecycleEvents.push({
                status: 'RELEASE_PAYMENT',
                timestamp: new Date().toISOString(),
                actorId: admin.id,
                actorName: admin.name,
                action: 'PAYMENT_RETRY_SUCCESS' as const,
                note: `Payment released to ${order.user.nexaWalletAddress}`,
                txHash,
                recipientAddress: order.user.nexaWalletAddress
            });
        }

        // Update order
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: newStatus,
                nexaTransactionHash: txHash,
                lifecycle: [...currentLifecycle, ...lifecycleEvents],
                paymentAttemptedAt: new Date(),
                paymentRecipientAddress: order.user.nexaWalletAddress || null,
                paymentFailureReason: failureReason
            }
        });

        return NextResponse.json({
            success: newStatus === 'RELEASE_PAYMENT',
            data: updatedOrder,
            message: failureReason || 'Payment processed successfully'
        });

    } catch (error) {
        console.error("[PaymentReprocess] Error:", error);
        return NextResponse.json({
            success: false,
            message: "Internal Error"
        }, { status: 500 });
    }
}
