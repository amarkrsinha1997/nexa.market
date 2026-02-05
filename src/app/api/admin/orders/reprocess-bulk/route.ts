
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BlockchainService } from "@/lib/services/blockchain.service";
import { nexaConfig } from "@/lib/config/nexa.config";
import { OrderStatus } from "@prisma/client";
import { AuthService, ApiError } from "@/lib/services/auth.service";

export async function POST(req: Request) {
    try {
        // 1. Verify Admin Auth
        const admin = await AuthService.authenticate(req);
        AuthService.isAdminOrThrowError(admin);

        const body = await req.json();
        const { orderIds } = body;

        if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
            return NextResponse.json({
                success: false,
                message: "Invalid orderIds"
            }, { status: 400 });
        }

        // Fetch all orders
        const orders = await prisma.order.findMany({
            where: {
                id: { in: orderIds },
                status: OrderStatus.ADMIN_APPROVED,
                paymentFailureReason: { not: null }
            },
            include: { user: true }
        });

        if (orders.length === 0) {
            return NextResponse.json({
                success: false,
                message: "No valid orders found to reprocess"
            }, { status: 400 });
        }

        const results: any[] = [];
        let successCount = 0;
        let failureCount = 0;

        // Process each order sequentially
        for (const order of orders) {
            let newStatus: OrderStatus = OrderStatus.ADMIN_APPROVED;
            let txHash: string | undefined;
            let failureReason: string | null = null;

            // Check wallet address
            if (!order.user.nexaWalletAddress) {
                failureReason = 'User has no Nexa wallet address';
            } else {
                // Validate address
                const blockchainService = await BlockchainService.instance();
                const addressValidation = blockchainService.validateAddress(
                    order.user.nexaWalletAddress,
                    nexaConfig.network
                );

                if (!addressValidation.valid || addressValidation.network !== nexaConfig.network) {
                    failureReason = `Invalid wallet address: ${addressValidation.error || 'Network mismatch'} `;
                } else {
                    // Check balance
                    const currentBalance = blockchainService.fundBalance;
                    if (currentBalance < order.nexaAmount) {
                        failureReason = `Insufficient balance: Required ${order.nexaAmount} NEX, Available ${currentBalance} NEX`;
                    } else {
                        // Attempt payment
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
                                successCount++;
                            } else {
                                failureReason = `Transfer failed: ${paymentResult.error} `;
                                failureCount++;
                            }
                        } catch (err) {
                            failureReason = `Transfer exception: ${err instanceof Error ? err.message : String(err)} `;
                            failureCount++;
                        }
                    }
                }
            }

            if (failureReason) {
                failureCount++;
            }

            // Create lifecycle event
            const currentLifecycle = (order.lifecycle as any[]) || [];
            const lifecycleEvent = failureReason ? {
                status: 'ADMIN_APPROVED',
                timestamp: new Date().toISOString(),
                actorId: admin.id,
                actorName: admin.name,
                action: 'PAYMENT_RETRY_FAILED' as const,
                note: failureReason,
                recipientAddress: order.user.nexaWalletAddress || null,
                bulkRetry: true
            } : {
                status: 'RELEASE_PAYMENT',
                timestamp: new Date().toISOString(),
                actorId: admin.id,
                actorName: admin.name,
                action: 'PAYMENT_RETRY_SUCCESS' as const,
                note: `Payment released to ${order.user.nexaWalletAddress} `,
                txHash,
                recipientAddress: order.user.nexaWalletAddress,
                bulkRetry: true
            };

            // Update order
            await prisma.order.update({
                where: { id: order.id },
                data: {
                    status: newStatus,
                    nexaTransactionHash: txHash,
                    lifecycle: [...currentLifecycle, lifecycleEvent],
                    paymentAttemptedAt: new Date(),
                    paymentRecipientAddress: order.user.nexaWalletAddress || null,
                    paymentFailureReason: failureReason
                }
            });

            results.push({
                orderId: order.id,
                success: newStatus === 'RELEASE_PAYMENT',
                message: failureReason || 'Payment successful',
                txHash
            });
        }

        return NextResponse.json({
            success: true,
            summary: {
                total: orders.length,
                succeeded: successCount,
                failed: failureCount
            },
            results
        });

    } catch (error) {
        console.error("[BulkPaymentReprocess] Error:", error);
        return NextResponse.json({
            success: false,
            message: "Internal Error"
        }, { status: 500 });
    }
}
