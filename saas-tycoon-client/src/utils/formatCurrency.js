export function formatCurrency(amount) {
  if (typeof amount !== 'number') return '$0';
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}