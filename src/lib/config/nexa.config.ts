/**
 * Nexa Blockchain Configuration
 * Manages connection settings and wallet credentials for Nexa network
 */

type NetworkType = 'mainnet' | 'testnet';

interface NexaConfig {
    providerUrl?: string;
    network: NetworkType;
    fundSeedPhrase: string;
    interestSeedPhrase: string;
}

function validateConfig(): NexaConfig {
    const network = (process.env.NEXA_NETWORK || 'testnet') as NetworkType;
    const fundSeedPhrase = process.env.NEXA_FUND_SEED_PHRASE || '';
    const interestSeedPhrase = process.env.NEXA_INTEREST_SEED_PHRASE || '';

    if (!fundSeedPhrase || !interestSeedPhrase) {
        console.warn(
            '⚠️  WARNING: Nexa seed phrases are missing. Blockchain operations will fail.'
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
        interestSeedPhrase,
    };
}

export const nexaConfig = validateConfig();

export type { NexaConfig, NetworkType };
