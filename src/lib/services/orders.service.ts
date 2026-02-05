/**
 * Orders Service
 * Handles all order-related business logic, including:
 * - Order Creation
 * - Price Calculation & UPI Selection
 * - Payment Confirmation & Verification
 * - Admin Decisions (Approve/Reject)
 * - Fund Release (Blockchain Interaction)
 * - Manual Payment Retries
 */

import { prisma } from "@/lib/prisma";
import { ConfigService } from "@/lib/services/config.service";
import { UPISelectorService } from "@/lib/services/upi-selector.service";
import { BlockchainService } from "@/lib/services/blockchain.service";
import { nexaConfig } from "@/lib/config/nexa.config";
import { User, Order, OrderStatus } from "@prisma/client";
import { UPIUrlBuilder } from "@/lib/utils/upi-url-builder";
import { AuthService } from "@/lib/services/auth.service";
import { NotificationService } from "@/lib/services/notification.service";
import "@/lib/server-init";

BlockchainService.instance();
export class ApiError extends Error {
    constructor(public message: string, public statusCode: number = 500) {
        super(message);
    }
}

export class OrdersService {
    /**
     * Create a new order for a user
     * @param userId - ID of the user creating the order
     * @param amountINR - Amount in INR
     */
    static async createOrder(userId: string, amountINR: number) {
        if (!amountINR || amountINR <= 0) {
            throw new ApiError("Invalid amount", 400);
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new ApiError("User not found", 404);

        if (!user.nexaWalletAddress) {
            throw new ApiError("Please save your Nexa wallet address in your profile first.", 400);
        }

        // Fetch price and calculate
        const nexaPrice = await ConfigService.getNexaPrice();
        const nexaAmount = await ConfigService.calculateNexaFromINR(amountINR);

        // Select UPI
        const selectedUPI = await UPISelectorService.selectUPI();
        if (!selectedUPI) {
            throw new ApiError("No payment methods available at this time. Please try again later.", 503);
        }

        // Create Order
        const order = await prisma.order.create({
            data: {
                userId: user.id,
                amountINR,
                nexaAmount: parseFloat(nexaAmount.toFixed(2)),
                nexaPrice,
                paymentQrId: selectedUPI.vpa,
                nexaAddress: user.nexaWalletAddress,
                status: "ORDER_CREATED",
                lifecycle: [
                    {
                        status: "ORDER_CREATED",
                        timestamp: new Date().toISOString(),
                        actorId: user.id,
                        actorName: user.name || "User",
                        actorEmail: user.email,
                        actorPicture: user.picture,
                        action: "ORDER_CREATED",
                        note: "Order initiated by user"
                    }
                ]
            }
        });

        // Build UPI String
        const upiString = new UPIUrlBuilder(selectedUPI.vpa)
            .setPayeeName("nexa.org")
            .setAmount(amountINR)
            .setCurrency("INR")
            .setTransactionNote(`${user.email} | Order: ${order.id.slice(0, 8)}`)
            .setTransactionRef(order.id)
            .build();

        return {
            orderId: order.id,
            upiId: selectedUPI.vpa,
            upiString,
            amountINR,
            nexaAmount
        };
    }

    /**
     * Fetch orders with pagination and filtering
     */
    static async getOrders(currentUser: User, page: number = 1, limit: number = 10, statusFilter?: string | null) {
        const isAdmin = currentUser.role === "ADMIN" || currentUser.role === "SUPERADMIN";
        const skip = (page - 1) * limit;

        let whereClause: any = isAdmin ? {} : { userId: currentUser.id };

        if (isAdmin && statusFilter) {
            if (statusFilter === "pending") {
                whereClause.status = { in: ["VERIFICATION_PENDING", "VERIFYING"] };
            } else if (statusFilter === "released") {
                whereClause.status = { in: ["RELEASE_PAYMENT"] };
            } else if (statusFilter === "rejected") {
                whereClause.status = "REJECTED";
            } else if (statusFilter === "transfer_failed") {
                whereClause.status = "ADMIN_APPROVED";
            }
        }

        const includeClause = isAdmin ? { user: { select: { name: true, email: true, picture: true, phoneNumber: true } } } : undefined;

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where: whereClause,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: includeClause,
            }),
            prisma.order.count({ where: whereClause })
        ]);

        return { orders, hasMore: skip + orders.length < total, total };
    }

    /**
     * Get single order by ID with security check
     */
    static async getOrderById(orderId: string, currentUser: User) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { user: true }
        });

        if (!order) throw new ApiError("Order not found", 404);

        if (order.userId !== currentUser.id && currentUser.role !== "ADMIN" && currentUser.role !== "SUPERADMIN") {
            throw new ApiError("Unauthorized", 403);
        }

        // Reconstruct UPI String if needed (optional logic from original route)
        const upiString = new UPIUrlBuilder(order.paymentQrId)
            .setPayeeName("nexa.org")
            .setAmount(order.amountINR)
            .setCurrency("INR")
            .setTransactionNote(`Order: ${order.id.slice(0, 8)} | ${order.user.email}`)
            .setTransactionRef(order.id)
            .build();

        return { order, upiString };
    }

    /**
     * Confirm payment for an order (User Action)
     */
    static async confirmPayment(orderId: string, currentUser: User, transactionId?: string) {
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order) throw new ApiError("Order not found", 404);

        if (order.userId !== currentUser.id) {
            throw new ApiError("Unauthorized access to order", 403);
        }

        const currentLifecycle = (order.lifecycle as any[]) || [];
        const lifecycleEvent = {
            status: "VERIFICATION_PENDING",
            timestamp: new Date().toISOString(),
            actorId: currentUser.id,
            actorName: currentUser.name || "User",
            actorEmail: currentUser.email,
            actorPicture: currentUser.picture,
            action: "PAYMENT_CONFIRMED",
            note: `Payment confirmed by user. Tx ID: ${transactionId || 'Not provided'}`
        };

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: "VERIFICATION_PENDING",
                transactionId: transactionId || null,
                lifecycle: [...currentLifecycle, lifecycleEvent]
            }
        });

        // Notify Admins
        await NotificationService.sendToAdmins(
            "🚀 Payment Received",
            `${currentUser.name || currentUser.username || currentUser.email} has confirmed payment of ₹${order.amountINR}. Action required!`,
            "SUCCESS",
            `/admin/orders/${orderId}`
        );

        return updatedOrder;
    }

    /**
     * Lock order for checking (Admin Action)
     */
    static async lockOrder(orderId: string, adminUser: User) {
        AuthService.isAdminOrThrowError(adminUser);

        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order) throw new ApiError("Order not found", 404);

        if (order.checkedBy && adminUser.role !== "SUPERADMIN") {
            throw new ApiError(`Order already locked by another admin (${order.checkedBy})`, 409);
        }

        const isSuperadminOverride = order.checkedBy && adminUser.role === "SUPERADMIN";
        const currentLifecycle = (order.lifecycle as any[]) || [];
        const lifecycleEvent = {
            status: "VERIFYING",
            timestamp: new Date().toISOString(),
            actorId: adminUser.id,
            actorName: adminUser.name,
            actorEmail: adminUser.email,
            actorPicture: adminUser.picture,
            action: "CHECK",
            note: isSuperadminOverride ? `SUPERADMIN override - locked by ${order.checkedBy}` : "Admin started checking order",
            isSuperadminOverride
        };

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                checkedBy: adminUser.id,
                status: "VERIFYING",
                lifecycle: [...currentLifecycle, lifecycleEvent]
            }
        });

        // Notify All Admins
        await NotificationService.sendToAdmins(
            "Order Locked by Admin",
            `${adminUser.name || adminUser.email} is now verifying Order #${order.id.slice(0, 8)}.`,
            "INFO",
            `/admin/orders/${orderId}`
        );

        return updatedOrder;
    }

    /**
     * Process Admin Decision (Approve/Reject)
     */
    static async processDecision(orderId: string, adminUser: User, decision: 'APPROVE' | 'REJECT', reason?: string) {
        AuthService.isAdminOrThrowError(adminUser);

        const order = await prisma.order.findUnique({ where: { id: orderId }, include: { user: true } });
        if (!order) throw new ApiError("Order not found", 404);

        if (order.checkedBy !== adminUser.id && adminUser.role !== "SUPERADMIN") {
            throw new ApiError("You are not the checking admin for this order", 403);
        }

        const isSuperadminOverride = order.checkedBy !== adminUser.id && adminUser.role === "SUPERADMIN";
        let newStatus: any = order.status;
        let txHash: string | undefined;
        let failureReason: string | null = null;

        if (decision === 'APPROVE') {
            newStatus = 'ADMIN_APPROVED';

            // Payment Logic
            if (order.user.nexaWalletAddress) {
                const blockchainService = await BlockchainService.instance();
                const addressValidation = blockchainService.validateAddress(order.user.nexaWalletAddress, nexaConfig.network);

                if (addressValidation.valid && addressValidation.network === nexaConfig.network) {
                    const currentBalance = blockchainService.fundBalance;
                    console.log(currentBalance, order.nexaAmount)
                    if (currentBalance < order.nexaAmount) {
                        failureReason = `Insufficient balance: Required ${order.nexaAmount} NEX, Available ${currentBalance} NEX`;
                    } else {
                        try {
                            const paymentResult = await blockchainService.processFundTransfer(
                                order.user.nexaWalletAddress,
                                order.nexaAmount.toFixed(2),
                                order.user.id
                            );
                            if (paymentResult.success) {
                                newStatus = 'RELEASE_PAYMENT';
                                txHash = paymentResult.txHash;
                            } else {
                                failureReason = `Transfer failed: ${paymentResult.error}`;
                            }
                        } catch (err) {
                            failureReason = `Transfer exception: ${err instanceof Error ? err.message : String(err)}`;
                        }
                    }
                } else {
                    failureReason = `Invalid wallet address: ${addressValidation.error || 'Address network mismatch'}`;
                }
            } else {
                failureReason = 'User has no Nexa wallet address';
            }
        } else {
            newStatus = 'REJECTED';
        }

        // Lifecycle Events
        const currentLifecycle = (order.lifecycle as any[]) || [];
        const lifecycleEvents: any[] = [];

        lifecycleEvents.push({
            status: decision === 'APPROVE' ? 'ADMIN_APPROVED' : 'REJECTED',
            timestamp: new Date().toISOString(),
            actorId: adminUser.id,
            actorName: adminUser.name,
            actorEmail: adminUser.email,
            actorPicture: adminUser.picture,
            action: decision,
            note: reason || (isSuperadminOverride ? `SUPERADMIN ${decision} (override)` : `Admin ${decision}`),
            isSuperadminOverride
        });

        if (decision === 'APPROVE' && failureReason) {
            lifecycleEvents.push({
                status: 'ADMIN_APPROVED',
                timestamp: new Date().toISOString(),
                actorId: 'SYSTEM',
                actorName: 'Payment System',
                action: 'PAYMENT_ATTEMPT_FAILED',
                note: failureReason,
                recipientAddress: order.user.nexaWalletAddress || null
            });
        }

        if (newStatus === 'RELEASE_PAYMENT' && txHash) {
            lifecycleEvents.push({
                status: 'RELEASE_PAYMENT',
                timestamp: new Date().toISOString(),
                actorId: 'SYSTEM',
                actorName: 'Blockchain Service',
                action: 'RELEASE_PAYMENT',
                note: `Payment released to ${order.user.nexaWalletAddress}`,
                txHash,
                recipientAddress: order.user.nexaWalletAddress
            });
        }

        const updatedResult = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: newStatus,
                nexaTransactionHash: txHash,
                lifecycle: [...currentLifecycle, ...lifecycleEvents],
                ...(decision === 'APPROVE' && {
                    paymentAttemptedAt: new Date(),
                    paymentRecipientAddress: order.user.nexaWalletAddress || null,
                    paymentFailureReason: failureReason
                })
            }
        });

        // Notifications for Admins
        if (decision === 'APPROVE') {
            await NotificationService.sendToAdmins(
                "Order Approved",
                `Order #${orderId.slice(0, 8)} approved by ${adminUser.name || adminUser.email}.`,
                "SUCCESS",
                `/admin/orders/${orderId}`
            );
        } else if (decision === 'REJECT') {
            await NotificationService.sendToAdmins(
                "Order Rejected",
                `Order #${orderId.slice(0, 8)} rejected by ${adminUser.name || adminUser.email}: ${reason || 'No reason provided'}.`,
                "WARNING",
                `/admin/orders/${orderId}`
            );

            // Also Notify the User
            await NotificationService.sendToUser(
                order.userId,
                "Order Rejected",
                `Your order #${orderId.slice(0, 8)} has been rejected: ${reason || 'Please contact support.'}`,
                "ERROR",
                `/users/orders/${orderId}`
            );
        }

        if (newStatus === 'RELEASE_PAYMENT') {
            await NotificationService.sendToAdmins(
                "Funds Released",
                `Payment released for Order #${orderId.slice(0, 8)}.`,
                "SUCCESS",
                `/admin/orders/${orderId}`
            );
        }

        return updatedResult;
    }

    /**
     * Manually Reprocess Payment (Admin Action)
     */
    static async reprocessPayment(orderId: string, adminUser: User) {
        AuthService.isAdminOrThrowError(adminUser);

        const order = await prisma.order.findUnique({ where: { id: orderId }, include: { user: true } });
        if (!order) throw new ApiError("Order not found", 404);

        if (order.status !== 'ADMIN_APPROVED') {
            throw new ApiError(`Cannot reprocess payment. Order status is ${order.status}`, 400);
        }
        if (!order.paymentFailureReason) {
            throw new ApiError("Order has no payment failure to retry", 400);
        }

        let newStatus: OrderStatus = OrderStatus.ADMIN_APPROVED;
        let txHash: string | undefined;
        let failureReason: string | null = null;

        // Validation & Transfer Logic
        if (!order.user.nexaWalletAddress) {
            failureReason = 'User has no Nexa wallet address';
        } else {
            const blockchainService = await BlockchainService.instance();
            const addressValidation = blockchainService.validateAddress(order.user.nexaWalletAddress, nexaConfig.network);
            if (!addressValidation.valid || addressValidation.network !== nexaConfig.network) {
                failureReason = `Invalid wallet address: ${addressValidation.error || 'Network mismatch'}`;
            } else {
                const currentBalance = blockchainService.fundBalance;
                if (currentBalance < order.nexaAmount) {
                    failureReason = `Insufficient balance: Required ${order.nexaAmount} NEX, Available ${currentBalance} NEX`;
                } else {
                    try {
                        const paymentResult = await blockchainService.processFundTransfer(
                            order.user.nexaWalletAddress,
                            order.nexaAmount.toFixed(2),
                            order.user.id
                        );
                        if (paymentResult.success) {
                            newStatus = OrderStatus.RELEASE_PAYMENT;
                            txHash = paymentResult.txHash;
                        } else {
                            failureReason = `Transfer failed: ${paymentResult.error}`;
                        }
                    } catch (err) {
                        failureReason = `Transfer exception: ${err instanceof Error ? err.message : String(err)}`;
                    }
                }
            }
        }

        // Lifecycle Events
        const currentLifecycle = (order.lifecycle as any[]) || [];
        const lifecycleEvents: any[] = [];

        if (failureReason) {
            lifecycleEvents.push({
                status: 'ADMIN_APPROVED',
                timestamp: new Date().toISOString(),
                actorId: adminUser.id,
                actorName: adminUser.name,
                action: 'PAYMENT_RETRY_FAILED',
                note: failureReason,
                recipientAddress: order.user.nexaWalletAddress || null
            });
        } else {
            lifecycleEvents.push({
                status: 'RELEASE_PAYMENT',
                timestamp: new Date().toISOString(),
                actorId: adminUser.id,
                actorName: adminUser.name,
                action: 'PAYMENT_RETRY_SUCCESS',
                note: `Payment released to ${order.user.nexaWalletAddress}`,
                txHash,
                recipientAddress: order.user.nexaWalletAddress
            });
        }

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

        // Notify Admins only
        if (newStatus === 'RELEASE_PAYMENT') {
            await NotificationService.sendToAdmins(
                "Retry Successful",
                `Manual payment retry successful for Order #${orderId.slice(0, 8)} by ${adminUser.name || adminUser.email}.`,
                "SUCCESS",
                `/admin/orders/${orderId}`
            );
        }

        return { success: newStatus === 'RELEASE_PAYMENT', order: updatedOrder, message: failureReason };
    }
}
