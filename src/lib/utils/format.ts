export const formatNexaAmount = (amount: number): string => {
    return amount.toLocaleString(undefined, { maximumFractionDigits: 2 });
};
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};
