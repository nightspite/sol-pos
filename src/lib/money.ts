export const formatMoney = (amount: number, type: 'cents' | 'dollars' = 'cents') => {
  if (type === 'cents') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      minimumFractionDigits: 0,
    }).format(amount / 100);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    minimumFractionDigits: 0,
  }).format(amount);
};
