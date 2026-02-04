/**
 * Blockchain Service
 * Handles all Nexa blockchain operations including wallet management,
 * transaction processing, and payment releases
 */

import { nexaConfig } from '../config/nexa.config';
import { AccountType, BaseAccount, Wallet, rostrumProvider } from 'nexa-wallet-sdk';
import { Address } from 'libnexa-ts';
import type { AddressValidationResult, TransactionResult, VerifyTransactionResult } from '@/types/blockchain';

export class ApiError extends Error {
    statusCode: number;
    code: string;

    constructor(message: string, code: string = 'INTERNAL_ERROR', statusCode: number = 500) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
    }
}

export const ErrorCode = {
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
    CONFIG_NOT_FOUND: 'CONFIG_NOT_FOUND',
    WALLET_NOT_INITIALIZED: 'WALLET_NOT_INITIALIZED',
    INVALID_ADDRESS: 'INVALID_ADDRESS',
    NETWORK_MISMATCH: 'NETWORK_MISMATCH',
    TRANSACTION_FAILED: 'TRANSACTION_FAILED',
};

export class BlockchainService {
    private fundWallet: Wallet | null = null;
    private static blockchainService: BlockchainService | null = null;
    private isInitialized = false;

    constructor() {
        console.log(`[BlockchainService] Initializing on ${nexaConfig.network}`);
    }

    private async init() {
        if (this.isInitialized) return;

        if (!nexaConfig.fundSeedPhrase) {
            console.error('[BlockchainService] Missing fund seed phrase');
            return;
        }

        try {
            await this.ensureConnection();

            console.log('[BlockchainService] Initializing fund wallet...');
            this.fundWallet = new Wallet(nexaConfig.fundSeedPhrase, nexaConfig.network);
            await this.fundWallet.initialize();

            this.isInitialized = true;
            console.log('[BlockchainService] Wallet initialized successfully');

            // Log wallet info
            console.log('[BlockchainService] Fund Address:', this.fundAddress);
            console.log('[BlockchainService] Fund Balance:', this.fundBalance, 'NEX');
        } catch (error) {
            console.error('[BlockchainService] Failed to initialize wallet:', error);
            throw error;
        }
    }

    /**
     * Validate Nexa address and check if it matches expected network
     */
    validateAddress(address: string, expectedNetwork: "mainnet" | "testnet" = nexaConfig.network): AddressValidationResult {
        try {
            const isValid = Address.isValid(address);
            if (!isValid) {
                return {
                    valid: false,
                    network: 'unknown',
                    error: 'Invalid address format',
                };
            }
            const isCorrectNetwork = Address.isValid(address, expectedNetwork);
            if (!isCorrectNetwork) {
                return {
                    valid: false,
                    network: address.includes('nexatest') ? 'testnet' : 'mainnet',
                    error: 'Invalid address format',
                };
            }
            return {
                valid: true,
                network: expectedNetwork,
            };
        } catch (error) {
            return {
                valid: false,
                network: 'unknown',
                error: error instanceof Error ? error.message : 'Invalid address format',
            };
        }
    }

    /**
     * Verify transaction on blockchain with full validation
     */
    async verifyTransaction(
        txHash: string,
        expectedAmount: string,
        expectedToAddress: string,
        expectedFromAddress: string
    ): Promise<VerifyTransactionResult> {
        await this.ensureConnection();

        try {
            const tx = await rostrumProvider.getTransaction(txHash);

            if (!tx) {
                return {
                    valid: false,
                    confirmed: false,
                    amount: '0',
                    from: '',
                    to: '',
                    error: 'Transaction not found on blockchain',
                };
            }

            const confirmed = (tx.confirmations || 0) > 0;

            const txTo = tx.vout.find((output) => {
                return output.scriptPubKey.addresses.includes(expectedToAddress);
            });
            const txFrom = tx.vout.find((output) => {
                return output.scriptPubKey.addresses.includes(expectedFromAddress);
            });

            const txAmount = txTo?.value.toString()!;

            // Validate amount matches
            const amountMatch = parseFloat(txAmount) === parseFloat(expectedAmount);

            // Validate to address matches
            const toMatch = Boolean(
                txTo?.scriptPubKey.addresses.includes(expectedToAddress)
            );

            // Validate from address if provided
            const fromMatch = Boolean(
                !expectedFromAddress ||
                txFrom?.scriptPubKey.addresses.includes(expectedFromAddress)
            );

            const valid = amountMatch && toMatch && fromMatch;

            if (!valid) {
                let error = 'Transaction validation failed: ';
                if (!amountMatch)
                    error += `Amount mismatch (expected: ${expectedAmount}, got: ${txAmount}). `;
                if (!toMatch)
                    error += `Recipient mismatch (expected: ${expectedToAddress}, got: ${txTo}). `;
                if (!fromMatch)
                    error += `Sender mismatch (expected: ${expectedFromAddress}, got: ${txFrom}). `;

                console.warn('[BlockchainService]', error);
            }

            return {
                valid,
                confirmed,
                amount: txAmount,
                from: txFrom?.scriptPubKey.addresses[0] || '',
                to: txTo?.scriptPubKey.addresses[0] || '',
                error: valid ? undefined : 'Validation failed',
            };
        } catch (error: any) {
            console.error(`[BlockchainService] Failed to verify transaction ${txHash}:`, error);
            return {
                valid: false,
                confirmed: false,
                amount: '0',
                from: '',
                to: '',
                error: error.message || 'Verification error',
            };
        }
    }

    /**
     * Get balance for an address
     */
    async getBalance(address: string): Promise<string> {
        if (!address) {
            console.warn('[BlockchainService] getBalance called with empty address');
            return '0';
        }

        if (address.length < 10) {
            console.warn(`[BlockchainService] getBalance called with invalid address: ${address}`);
            return '0';
        }

        try {
            await this.ensureConnection();
            const balance = await rostrumProvider.getBalance(address);
            const confirmed = Number(balance.confirmed) || 0;
            const unconfirmed = Number(balance.unconfirmed) || 0;
            return (confirmed + unconfirmed).toString();
        } catch (error) {
            console.error(`[BlockchainService] Error fetching balance for ${address}:`, error);
            return '0';
        }
    }

    /**
     * Process fund transfer (send funds to user)
     * Used for releasing payments to users upon admin approval
     */
    async processFundTransfer(
        toAddress: string,
        amount: string,
        userId?: string
    ): Promise<TransactionResult> {
        try {
            // Validate address before sending
            const validation = this.validateAddress(toAddress, nexaConfig.network);
            if (!validation.valid) {
                throw new ApiError(
                    validation.error || 'Invalid address',
                    ErrorCode.INVALID_ADDRESS,
                    400
                );
            }

            if (validation.network !== nexaConfig.network) {
                throw new ApiError(
                    `Address network (${validation.network}) does not match configured network (${nexaConfig.network})`,
                    ErrorCode.NETWORK_MISMATCH,
                    400
                );
            }

            if (!this.fundWallet) {
                throw new ApiError(
                    'Fund wallet not initialized',
                    ErrorCode.WALLET_NOT_INITIALIZED,
                    500
                );
            }

            await this.ensureConnection();
            const account = this.fundAccount;

            if (!account) {
                throw new ApiError(
                    'No account found in Fund Wallet',
                    ErrorCode.CONFIG_NOT_FOUND,
                    500
                );
            }

            console.log('[BlockchainService] Processing payment release:', {
                to: toAddress,
                amount,
                network: nexaConfig.network,
                userId: userId || 'unknown'
            });

            const tx = await this.fundWallet
                .newTransaction(account)
                .onNetwork(nexaConfig.network)
                .sendTo(toAddress, amount)
                .populate()
                .sign()
                .build();

            const txId = await this.fundWallet.sendTransaction(tx);

            console.log('[BlockchainService] Payment released successfully:', {
                txHash: txId,
                to: toAddress,
                amount,
                userId: userId || 'unknown'
            });

            return {
                txHash: txId,
                success: true,
            };
        } catch (error: any) {
            console.error('[BlockchainService] Payment release failed:', error);
            return {
                txHash: '',
                success: false,
                error: error.message || 'Transaction failed',
            };
        }
    }

    /**
     * Get transaction details
     */
    async getTransaction(txHash: string): Promise<ReturnType<typeof rostrumProvider.getTransaction>> {
        await this.ensureConnection();
        return await rostrumProvider.getTransaction(txHash);
    }

    /**
     * Ensure connection to Rostrum provider with retry logic
     */
    /**
     * Ensure connection to Rostrum provider with retry logic
     */
    private async ensureConnection() {
        const maxRetries = 3;
        const retryDelay = 1000;

        // Check if already connected by pinging latency
        try {
            await rostrumProvider.getLatency();
            return; // Connection is active
        } catch (e) {
            // Not connected, proceed to connect
            console.log('[BlockchainService] Not connected, initiating connection...');
        }

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                if (nexaConfig.providerUrl) {
                    const url = new URL(nexaConfig.providerUrl);
                    await rostrumProvider.connect(nexaConfig.network, {
                        host: url.hostname,
                        port: parseInt(url.port),
                        scheme: url.protocol === 'wss:' ? 'wss' : 'ws',
                    });
                } else {
                    await rostrumProvider.connect(nexaConfig.network);
                }

                // Verify connection
                await rostrumProvider.getLatency();
                console.log('[BlockchainService] Connected to blockchain');
                return;
            } catch (error) {
                console.warn(
                    `[BlockchainService] Connection attempt ${attempt} failed:`,
                    error instanceof Error ? error.message : String(error)
                );

                if (attempt === maxRetries) {
                    console.error(`[BlockchainService] Failed to connect after ${maxRetries} attempts`);
                    throw error;
                }

                await new Promise((resolve) => setTimeout(resolve, retryDelay));
            }
        }
    }

    // Getters
    private get fundAccount(): BaseAccount | undefined {
        if (!this.fundWallet) {
            throw new ApiError('Fund wallet not initialized', ErrorCode.WALLET_NOT_INITIALIZED, 500);
        }
        return this.fundWallet.accountStore.getAccount('2.0');
    }

    public get fundAddress(): string {
        return this.fundAccount?.getAddresses()[0].address || '';
    }

    public get fundBalance(): number {
        const confirmed = Number(this.fundAccount?.balance.confirmed) || 0;
        const unconfirmed = Number(this.fundAccount?.balance.unconfirmed) || 0;
        return (confirmed + unconfirmed) / 100;
    }

    public get rostrumProvider(): typeof rostrumProvider {
        return rostrumProvider;
    }

    // Singleton instance
    static instance(): BlockchainService {
        if (this.blockchainService) return this.blockchainService;
        this.blockchainService = new BlockchainService();
        this.blockchainService.init();
        return this.blockchainService;
    }
}

export const blockchainService = BlockchainService.instance();
