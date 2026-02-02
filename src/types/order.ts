export interface Order {
    id: string;
    amountINR: number;
    nexaAmount: number;
    nexaPrice: number;
    status: string;
    paymentQrId: string;
    transactionId: string | null;
    createdAt: string;
}
