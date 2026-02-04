export const formatNexaAmount = (amount: number): string => {
    return amount.toLocaleString(undefined, { maximumFractionDigits: 2 });
};
