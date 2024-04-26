export const balanceFormat = (
  balance: number | undefined,
  decimals: 2,
): string =>
  balance === undefined
    ? '--'
    : Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals,
      }).format(balance);
