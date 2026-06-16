export const SUPPORTED_CURRENCIES_WITHOUT_DECIMALS = new Set([
  'bif',
  'clp',
  'djf',
  'gnf',
  'jpy',
  'kmf',
  'krw',
  'mga',
  'pyg',
  'rwf',
  'ugx',
  'vnd',
  'vuv',
  'xaf',
  'xof',
  'xpf',
]);

export function toStripeAmount(amount, currency) {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return null;
  }

  return SUPPORTED_CURRENCIES_WITHOUT_DECIMALS.has(currency.toLowerCase())
    ? Math.round(numericAmount)
    : Math.round(numericAmount * 100);
}

export function fromStripeAmount(amount, currency) {
  if (amount == null) return 0;

  return SUPPORTED_CURRENCIES_WITHOUT_DECIMALS.has(currency?.toLowerCase())
    ? amount
    : amount / 100;
}
