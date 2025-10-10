// tslint:disable:typedef
import crypto from 'crypto';

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

export function getDateUtc(): Date {
  return new Date(new Date().toUTCString());
}

export function getTimeUtc(): number {
  return getDateUtc().getTime();
}

export function sleep(ms: number): Promise<unknown> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function format(text: string, ...args: string[]): string {
  return text.replace(/{(\d+)}/g, (match, num) => {
    return typeof args[num] !== 'undefined' ? args[num] : match;
  });
}

export function getNicknameFromWalletAddress(walletAddress: string, prefix = 'V', length = 15): string {
  const prefixLength = prefix.length;
  if (prefixLength > length) {
    return walletAddress.slice(length);
  }
  return prefix + walletAddress.slice(-(length - prefixLength));
}

export const calculateSha1: (str: string, salt: string) => string = (str, salt) =>
  crypto.createHash('sha1').update(str, 'binary').update(salt, 'binary').digest('hex');

/**
 * Capitalize a string
 *
 * @export
 * @param {string} str The original string, which can include multiple words
 * @returns {string} The string with capitalized first letter word by word
 */
export function capitalize(str: string): string {
  if (!str) {
    return '';
  }
  return str.toLowerCase().replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase());
}

/**
 * Generate a ran dom string, including letters and numbers
 *
 * @export
 * @param length The length of the expected string
 * @returns {string} The generated string
 */
export function generateString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}
