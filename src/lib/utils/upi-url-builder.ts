/**
 * UPI URL Builder
 * 
 * Builds UPI payment URLs according to a minimal specification requested by the user.
 * 
 * UPI URL Format (Minimal):
 * upi://pay?pa=<VPA>&pn=<Payee Name>&am=<Amount>&tn=<Transaction Note>
 * 
 * Required Parameters:
 * - pa: Payee VPA (Virtual Payment Address) - e.g., merchant@bank
 * 
 * Optional Parameters:
 * - pn: Payee Name - Merchant/Business name
 * - am: Amount - Transaction amount (decimal)
 * - tn: Transaction Note - Description/purpose of payment
 */

export interface UPIPaymentParams {
    /** Payee VPA (Virtual Payment Address) - Required */
    vpa: string;

    /** Payee/Merchant Name - Optional */
    payeeName?: string;

    /** Transaction Amount - Optional */
    amount?: number;

    /** Transaction Note/Description - Optional */
    transactionNote?: string;
}

export class UPIUrlBuilder {
    private params: UPIPaymentParams;

    constructor(vpa: string) {
        this.params = { vpa };
    }

    /**
     * Set the payee/merchant name
     * @param name - Name of the merchant or payee
     * @returns UPIUrlBuilder instance for chaining
     */
    setPayeeName(name: string): UPIUrlBuilder {
        this.params.payeeName = name;
        return this;
    }

    /**
     * Set the transaction amount
     * @param amount - Amount in INR
     * @returns UPIUrlBuilder instance for chaining
     */
    setAmount(amount: number): UPIUrlBuilder {
        this.params.amount = amount;
        return this;
    }

    /**
     * Set the transaction note/description
     * @param note - Description or purpose of the transaction
     * @returns UPIUrlBuilder instance for chaining
     */
    setTransactionNote(note: string): UPIUrlBuilder {
        this.params.transactionNote = note;
        return this;
    }

    /**
     * Build the complete UPI payment URL
     * @returns Complete UPI deep link URL
     * 
     * @example
     * const url = new UPIUrlBuilder("merchant@bank")
     *   .setPayeeName("Nexa Market")
     *   .setAmount(500)
     *   .setTransactionNote("NEXA Token Purchase")
     *   .build();
     * // Returns: upi://pay?pa=merchant@bank&pn=Nexa%20Market&am=500&tn=NEXA%20Token%20Purchase
     */
    build(): string {
        const queryParams: string[] = [];

        // Required parameter: pa
        queryParams.push(`pa=${encodeURIComponent(this.params.vpa)}`);

        // Optional parameters: pn, am, tn
        if (this.params.payeeName) {
            queryParams.push(`pn=${encodeURIComponent(this.params.payeeName)}`);
        }

        if (this.params.amount !== undefined) {
            queryParams.push(`am=${this.params.amount}`);
        }

        if (this.params.transactionNote) {
            queryParams.push(`tn=${encodeURIComponent(this.params.transactionNote)}`);
        }

        return `upi://pay?${queryParams.join('&')}`;
    }

    /**
     * Get the current parameters
     * @returns Current UPI payment parameters
     */
    getParams(): UPIPaymentParams {
        return { ...this.params };
    }

    /**
     * Static helper to create a simple UPI URL with minimal parameters
     * @param vpa - Virtual Payment Address
     * @param amount - Transaction amount
     * @param note - Transaction note
     * @returns Complete UPI URL
     */
    static createSimple(vpa: string, amount: number, note: string): string {
        return new UPIUrlBuilder(vpa)
            .setAmount(amount)
            .setTransactionNote(note)
            .build();
    }
}
