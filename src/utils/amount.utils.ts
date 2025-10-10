import BigNumber from 'bignumber.js';

export function formatCrypto(amount: number, limitDecimal: number = 2, method: string = 'floor') {
  const checkDecimalLimitAmount = new BigNumber(10).pow(limitDecimal).toNumber();
  const checkNumber = Math[method](new BigNumber(amount).multipliedBy(checkDecimalLimitAmount).toNumber());
  const amountFormatted = new BigNumber(checkNumber).dividedBy(checkDecimalLimitAmount).toFixed(limitDecimal);
  const chars = amountFormatted.split('.');
  if (chars.length === 1) {
    return Number(chars[0]).toLocaleString('en-US');
  }
  return Number(chars[0]).toLocaleString('en-US') + '.' + chars[1];
}
