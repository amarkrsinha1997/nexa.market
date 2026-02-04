// Lifecycle event structure
export interface LifecycleEvent {
    status: string;
    timestamp: string; // ISO 8601
    actorId: string;   // Admin user ID
    actorName: string | null;
    actorEmail: string;
    actorPicture: string | null;
    action: 'ORDER_CREATED' | 'PAYMENT_CONFIRMED' | 'CHECK' | 'APPROVE' | 'REJECT' | 'UPDATE' | 'RELEASE_PAYMENT' | 'PAYMENT_ATTEMPT_FAILED' | 'PAYMENT_RETRY_FAILED' | 'PAYMENT_RETRY_SUCCESS';
    note?: string;     // Optional reason/note
    isSuperadminOverride?: boolean; // True if superadmin overrode lock
    recipientAddress?: string; // For payment events
    txHash?: string; // For payment events
}

export interface Order {
    id: string;
    userId: string;
    amountINR: number;
    nexaAmount: number;
    nexaPrice: number;
    status: string;
    paymentQrId: string;
    transactionId: string | null;
    nexaAddress?: string | null;
    verifiedBy?: string | null;
    checkedBy?: string | null;
    user?: {
        name: string;
        email: string;
        picture?: string | null;
        phoneNumber?: string | null;
    };
    lifecycle?: LifecycleEvent[];
    paymentAttemptedAt?: string | null;
    paymentRecipientAddress?: string | null;
    paymentFailureReason?: string | null;
    nexaTransactionHash?: string | null;
    createdAt: string;
    updatedAt: string;
}

