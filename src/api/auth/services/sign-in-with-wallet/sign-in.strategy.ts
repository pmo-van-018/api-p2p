import { ethers } from 'ethers';
import { ethereumGrammarParser, tronGrammarParser } from './messsage-parser/message-parser.provider';
import { ParsedMessage } from './messsage-parser/parsed-message';
import { ethereumSignInMessageValidator, tronSignInMessageValidator } from './messsage-parser/parsed-message.validator';
import { toHex, verifyMessage, verifyMessageV2 } from '@api/order/services/TronService';

const siweUnmarshall = (message: string): ParsedMessage => {
  const msg =  ethereumGrammarParser(message);
  if (!ethereumSignInMessageValidator(msg)) {
    throw new Error('Malformed message.');
  }
  return msg;
};

const tronWalletUnmarshall = (message: string): ParsedMessage => {
  const msg = tronGrammarParser(message);
  if (!tronSignInMessageValidator(msg)) {
    throw new Error('Malformed message.');
  }
  return msg;
};

const ethereumVerifyMessage = async ( msg: string, signature: string, signInMessage: ParsedMessage): Promise<boolean> => {
  try {
    const recorveredAddress = ethers.utils.verifyMessage(msg, signature);
    return recorveredAddress === signInMessage.address;
  } catch (error) {
    throw new Error('Invalid signature.');
  }
};

const tronVerifySignMessageV1 = async ( msg: string, signature: string, signInMessage: ParsedMessage): Promise<boolean> => {
  try {
    return await verifyMessage(toHex(msg), signature, signInMessage.address);
  } catch (error) {
    throw new Error('Invalid signature.');
  }
};

const tronVerifySignMessageV2 = async ( msg: string, signature: string, signInMessage: ParsedMessage): Promise<boolean> => {
  try {
    const signAddress = await verifyMessageV2(msg, signature);
    const expectAddress = signInMessage.address;
    return signAddress === expectAddress;
  } catch (error) {
    throw new Error('Invalid signature.');
  }
};

export interface SIStrategy {
  unmarshalMessage: (message: string) => ParsedMessage;
  verifySignedMessage: (msg: string, signature: string, signInMessage: ParsedMessage) => Promise<boolean>;
}

export const SIStrategies = {
  ['Tron Wallet']: {
    unmarshalMessage: tronWalletUnmarshall,
    verifySignedMessage: tronVerifySignMessageV2,
  },
  ['Tron Wallet V1']: {
    unmarshalMessage: tronWalletUnmarshall,
    verifySignedMessage: tronVerifySignMessageV1,
  },
  ['Ethereum']: {
    unmarshalMessage: siweUnmarshall,
    verifySignedMessage: ethereumVerifyMessage,
  },
};

export class SIStrategyFactory {
  public static from(loginType: string): SIStrategy {
    return SIStrategies[loginType] ?? SIStrategies['Ethereum'];
  }
}
