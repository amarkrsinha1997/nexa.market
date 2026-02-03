// Lifecycle event structure
export interface LifecycleEvent {
    status: string;
    timestamp: string; // ISO 8601
    actorId: string;   // Admin user ID
    actorName: string | null;
    actorEmail: string;
    actorPicture: string | null;
    action: 'CHECK' | 'APPROVE' | 'REJECT' | 'UPDATE';
    note?: string;     // Optional reason/note
    isSuperadminOverride?: boolean; // True if superadmin overrode lock
}

export interface Order {
    id: string;
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
    createdAt: string;
    updatedAt: string;
}

