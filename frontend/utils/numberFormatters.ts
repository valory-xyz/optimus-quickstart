export const balanceFormat = (
  balance: number | undefined,
  decimals: 2,
): string => {
  if (balance === undefined) return '--';
  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(balance);
};
