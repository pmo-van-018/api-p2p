import { keccak_256 } from '@noble/hashes/sha3';
import { bytesToHex } from '@noble/hashes/utils';
import TronWeb from 'tronweb';
import { ParsedMessage } from './parsed-message';
import * as uri from 'valid-url';
import { all } from '@base/utils/fp.utils';

// eslint-disable-next-line security/detect-unsafe-regex
const ISO8601 = /^(?<date>[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01]))[Tt]([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]|60)(.[0-9]+)?(([Zz])|([+|-]([01][0-9]|2[0-3]):[0-5][0-9]))$/;

export const domainValid = (message: ParsedMessage) => {
    return message.domain && message.domain.length !== 0 && /[^#?]*/.test(message.domain);
  };

export const isEIP55Address = (message: ParsedMessage) => {
    const address = message.address;
    if (address.length !== 42) {
        return false;
    }

    const lowerAddress = `${address}`.toLowerCase().replace('0x', '');
    const hash = bytesToHex(keccak_256(lowerAddress));
    let ret = '0x';

    for (let i = 0; i < lowerAddress.length; i++) {
        if (parseInt(hash[i], 16) >= 8) {
            ret += lowerAddress[i].toUpperCase();
        } else {
            ret += lowerAddress[i];
        }
    }
    return address === ret;
};

export const isTronAddress = (message: ParsedMessage) => {
    return TronWeb.isAddress(message.address);
};

export const isUri = (message: ParsedMessage) => {
    return !!uri.isUri(message.uri);
};

export const versionValid = (message: ParsedMessage) => {
    return message.version === '1';
};

export const nonceValid = (message: ParsedMessage) => {
    const nonce = message?.nonce?.match(/[a-zA-Z0-9]{8,}/);
    return nonce && message.nonce.length >= 8 && nonce[0] === message.nonce;
};

export const isValidISO8601Date = (inputDate: string): boolean => {
    /* Split groups and make sure inputDate is in ISO8601 format */
    const inputMatch = ISO8601.exec(inputDate);

    /* if inputMatch is null the date is not ISO-8601 */
    if (!inputDate) {
      return false;
    }

    /* Creates a date object with input date to parse for invalid days e.g. Feb, 30 -> Mar, 01 */
    const inputDateParsed = new Date(inputMatch.groups.date).toISOString();

    /* Get groups from new parsed date to compare with the original input */
    const parsedInputMatch = ISO8601.exec(inputDateParsed);

    /* Compare remaining fields */
    return inputMatch.groups.date === parsedInputMatch.groups.date;
  };

export const issueAtValid = (message: ParsedMessage) => {
    return !!(!message.issuedAt || isValidISO8601Date(message.issuedAt));
};

export const expirationValid = (message: ParsedMessage) => {
    return !!(!message.expirationTime || isValidISO8601Date(message.expirationTime));
};

export const notBeforetValid = (message: ParsedMessage) => {
    return !!(!message.notBefore || isValidISO8601Date(message.notBefore));
};

export const tronSignInMessageValidator = (message: ParsedMessage) => {
    return all(
        domainValid,
        isTronAddress,
        isUri,
        versionValid,
        nonceValid,
        issueAtValid,
        expirationValid,
        notBeforetValid
    )(message);
};

export const ethereumSignInMessageValidator = (message: ParsedMessage) => {
    return all(
        domainValid,
        isEIP55Address,
        isUri,
        versionValid,
        nonceValid,
        issueAtValid,
        expirationValid,
        notBeforetValid
    )(message);
};
