import { isTronWalletAddress } from '@api/order/services/TronService';
import { ethers } from 'ethers';

export function format(text: string, ...args: string[]): string {
  return text.replace(/{(\d+)}/g, (match, num) => {
    return typeof args[num] !== 'undefined' ? args[num] : match;
  });
}

export function captialize(text: string): string {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
}

export function insertAdjacentTextInFront(text: string, frontText: string): string {
  return frontText + text;
}

export function convertOrderIdsToString(array: number[] | string[]) {
  return array.map((number) => insertAdjacentTextInFront(number.toString(), '#')).join(', ');
}

export function formatMoney(amount: number) {
  return new Intl.NumberFormat().format(amount);
}

export function formatBankNumber(bankNumber: string): string {
  let newFormatBankNumber = '';
  if (bankNumber) {
    const hideSymbol = '*';
    const bankNumberLength = bankNumber.length;
    const hiddenLength = Math.max(bankNumber.length - 4, 0);
    newFormatBankNumber = `${hideSymbol.repeat(hiddenLength)}${bankNumber.substring(
      hiddenLength,
      bankNumberLength
    )}`;
  }
  return newFormatBankNumber;
}

export function unescape(text: string): string {
  return (text?.replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x2F;/g, '/')
    .replace(/&#x5C;/g, '\\')
    .replace(/&#96;/g, '`')
    .replace(/&amp;/g, '&'));
}

export function validateWalletAddress(walletAddress: string): boolean {
  return ethers.utils.isAddress(walletAddress) || isTronWalletAddress(walletAddress);
}

export const maskBank = (num: string): string => {
  const patterns = {
    1: [/^(.{1})$/, `$1`],
    2: [/^(.{2})$/, `$1`],
    3: [/^(.{1}).+(.{1})$/, `$1*$2`],
    4: [/^(.{1}).+(.{1})$/, `$1**$2`],
    5: [/^(.{1}).+(.{1})$/, `$1***$2`],
    6: [/^(.{1}).+(.{2})$/, `$1***$2`],
    7: [/^(.{1}).+(.{3})$/, `$1***$2`],
    8: [/^(.{2}).+(.{3})$/, `$1***$2`],
  };
  return num.replace(
    patterns[num.length]?.[0] ?? /^(.{3}).+(.{3})$/,
    patterns[num.length]?.[1] ?? `$1${'*'.repeat(num.length - 6)}$2`
  );
};
