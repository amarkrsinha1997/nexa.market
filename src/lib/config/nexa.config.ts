/**
 * Nexa Blockchain Configuration
 * Manages connection settings and wallet credentials for Nexa network
 */

type NetworkType = 'mainnet' | 'testnet';

interface NexaConfig {
    providerUrl?: string;
    network: NetworkType;
    fundSeedPhrase: string;
}

function validateConfig(): NexaConfig {
    const network = (process.env.NEXA_NETWORK || 'testnet') as NetworkType;
    const fundSeedPhrase = process.env.NEXA_FUND_SEED_PHRASE || '';

    const missingPhrases = [];
    if (!fundSeedPhrase) missingPhrases.push('NEXA_FUND_SEED_PHRASE');

    if (missingPhrases.length > 0) {
        console.warn(
            `⚠️  WARNING: Nexa seed phrases are missing (${missingPhrases.join(', ')}). Blockchain operations using these wallets will fail.`
        );
    }

    if (network !== 'mainnet' && network !== 'testnet') {
        console.warn(
            `⚠️  WARNING: Invalid NEXA_NETWORK value "${network}". Defaulting to "testnet".`
        );
    }

    return {
        providerUrl: process.env.NEXA_PROVIDER_URL,
        network: network === 'mainnet' ? 'mainnet' : 'testnet',
        fundSeedPhrase,
    };
}

export const nexaConfig = validateConfig();

export type { NexaConfig, NetworkType };
