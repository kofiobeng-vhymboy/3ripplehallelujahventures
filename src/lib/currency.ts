export const formatGhs = (amount: number) => new Intl.NumberFormat('en-GH', {
  style: 'currency',
  currency: 'GHS',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format(Number.isFinite(amount) ? amount : 0);
