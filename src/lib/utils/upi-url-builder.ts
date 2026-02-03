/**
 * UPI URL Builder
 * 
 * Builds UPI payment URLs according to the NPCI UPI Deep Linking specification.
 * 
 * @see https://www.npci.org.in/what-we-do/upi/upi-specifications
 * 
 * UPI URL Format:
 * upi://pay?pa=<VPA>&pn=<Payee Name>&am=<Amount>&cu=<Currency>&tn=<Transaction Note>&tr=<Transaction Reference>
 * 
 * Required Parameters:
 * - pa: Payee VPA (Virtual Payment Address) - e.g., merchant@bank
 * 
 * Optional Parameters:
 * - pn: Payee Name - Merchant/Business name
 * - am: Amount - Transaction amount (decimal)
 * - cu: Currency - Default: INR
 * - tn: Transaction Note - Description/purpose of payment
 * - tr: Transaction Reference - Unique transaction ID
 * - mc: Merchant Category Code
 * - mode: Transaction mode (00 = default, 01 = QR code)
 * - purpose: Purpose code (as per RBI guidelines)
 * - orgid: Organization ID
 * - sign: Digital signature for validation
 */

export interface UPIPaymentParams {
    /** Payee VPA (Virtual Payment Address) - Required */
    vpa: string;

    /** Payee/Merchant Name - Optional */
    payeeName?: string;

    /** Transaction Amount - Optional */
    amount?: number;

    /** Currency Code - Default: INR */
    currency?: string;

    /** Transaction Note/Description - Optional */
    transactionNote?: string;

    /** Transaction Reference/Order ID - Optional */
    transactionRef?: string;

    /** Merchant Category Code - Optional */
    merchantCode?: string;

    /** Transaction Mode (00 = default, 01 = QR) - Optional */
    mode?: string;

    /** Purpose Code - Optional */
    purpose?: string;

    /** Organization ID - Optional */
    orgId?: string;
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
     * @param amount - Amount in INR (or specified currency)
     * @returns UPIUrlBuilder instance for chaining
     */
    setAmount(amount: number): UPIUrlBuilder {
        this.params.amount = amount;
        return this;
    }

    /**
     * Set the currency code
     * @param currency - Currency code (default: INR)
     * @returns UPIUrlBuilder instance for chaining
     */
    setCurrency(currency: string = "INR"): UPIUrlBuilder {
        this.params.currency = currency;
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
     * Set the transaction reference (usually order ID)
     * @param ref - Unique transaction reference or order ID
     * @returns UPIUrlBuilder instance for chaining
     */
    setTransactionRef(ref: string): UPIUrlBuilder {
        this.params.transactionRef = ref;
        return this;
    }

    /**
     * Set the merchant category code
     * @param code - Merchant category code
     * @returns UPIUrlBuilder instance for chaining
     */
    setMerchantCode(code: string): UPIUrlBuilder {
        this.params.merchantCode = code;
        return this;
    }

    /**
     * Set the transaction mode
     * @param mode - Transaction mode (00 = default, 01 = QR code)
     * @returns UPIUrlBuilder instance for chaining
     */
    setMode(mode: string): UPIUrlBuilder {
        this.params.mode = mode;
        return this;
    }

    /**
     * Set the purpose code
     * @param purpose - Purpose code as per RBI guidelines
     * @returns UPIUrlBuilder instance for chaining
     */
    setPurpose(purpose: string): UPIUrlBuilder {
        this.params.purpose = purpose;
        return this;
    }

    /**
     * Set the organization ID
     * @param orgId - Organization identifier
     * @returns UPIUrlBuilder instance for chaining
     */
    setOrgId(orgId: string): UPIUrlBuilder {
        this.params.orgId = orgId;
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
     *   .setTransactionRef("ORDER123")
     *   .build();
     * // Returns: upi://pay?pa=merchant@bank&pn=Nexa%20Market&am=500&cu=INR&tn=NEXA%20Token%20Purchase&tr=ORDER123
     */
    build(): string {
        const queryParams: string[] = [];

        // Required parameter
        queryParams.push(`pa=${encodeURIComponent(this.params.vpa)}`);

        // Optional parameters
        if (this.params.payeeName) {
            queryParams.push(`pn=${encodeURIComponent(this.params.payeeName)}`);
        }

        if (this.params.amount !== undefined) {
            queryParams.push(`am=${this.params.amount}`);
        }

        if (this.params.currency) {
            queryParams.push(`cu=${this.params.currency}`);
        } else if (this.params.amount !== undefined) {
            // Default to INR if amount is specified but currency is not
            queryParams.push(`cu=INR`);
        }

        if (this.params.transactionNote) {
            queryParams.push(`tn=${encodeURIComponent(this.params.transactionNote)}`);
        }

        if (this.params.transactionRef) {
            queryParams.push(`tr=${encodeURIComponent(this.params.transactionRef)}`);
        }

        if (this.params.merchantCode) {
            queryParams.push(`mc=${encodeURIComponent(this.params.merchantCode)}`);
        }

        if (this.params.mode) {
            queryParams.push(`mode=${this.params.mode}`);
        }

        if (this.params.purpose) {
            queryParams.push(`purpose=${encodeURIComponent(this.params.purpose)}`);
        }

        if (this.params.orgId) {
            queryParams.push(`orgid=${encodeURIComponent(this.params.orgId)}`);
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
            .setCurrency("INR")
            .build();
    }
}
