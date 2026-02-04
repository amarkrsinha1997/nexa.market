/**
 * Blockchain Types
 * TypeScript interfaces for blockchain operations
 */

export interface BlockchainConfig {
    network: 'mainnet' | 'testnet';
    providerUrl?: string;
    fundSeedPhrase: string;
}

export interface TransactionResult {
    txHash: string;
    success: boolean;
    error?: string;
}

export interface AddressValidationResult {
    valid: boolean;
    network: 'mainnet' | 'testnet' | 'unknown';
    error?: string;
}

export interface VerifyTransactionResult {
    valid: boolean;
    confirmed: boolean;
    amount: string;
    from: string;
    to: string;
    error?: string;
}
