import { env } from '@base/env';
import { Logger } from '@base/utils/logger';
import { wrap } from '@base/utils/redis-client';
import { ethers } from 'ethers';
import moment from 'moment';
import TronWeb from 'tronweb';
import { ConfirmedTransaction, TronStatus, TronTransaction } from '@api/order/interfaces/Tron';
const logger = new Logger(__filename);

const Tron = new TronWeb({
  fullHost: env.tronlink.fullHost,
  privateKey: env.tronlink.privateKey,
});

const ADDRESS_PREFIX = '41';
export const TRON_NATIVE_DECIMAL = 6;

export const TRANSFER_EVENT = ethers.utils.id('Transfer(address,address,uint256)').substring(2);

export const toBase58 = (value: string) => TronWeb.address.fromHex(value);
export const contractToBase58 = (value: string) => toBase58(`${ADDRESS_PREFIX}${value}`);
export const convertLogToBase58 = (value: string) => toBase58(`${ADDRESS_PREFIX}${value.slice(-40)}`);

const getConfirmedTransaction = async (txnId): Promise<ConfirmedTransaction> => {
  return await Tron.trx.getConfirmedTransaction(txnId);
};

const isNativeTransfer = (txn): boolean => {
  return txn?.raw_data?.contract[0]?.type === 'TransferContract';
};
const isContractInteraction = (txn): boolean => {
  return txn?.raw_data?.contract[0]?.type === 'TriggerSmartContract';
};

export const decodeParams = (types, output, ignoreMethodHash) => {
  if (!output || typeof output === 'boolean') {
    ignoreMethodHash = output;
    output = types;
  }

  if (ignoreMethodHash && output.replace(/^0x/, '').length % 64 === 8) {
    output = '0x' + output.replace(/^0x/, '').substring(8);
  }

  const abiCoder = new ethers.utils.AbiCoder();

  if (output.replace(/^0x/, '').length % 64) {
    throw new Error('The encoded string is not valid. Its length must be a multiple of 64.');
  }
  return abiCoder.decode(types, output).reduce((obj, arg, index) => {
    if (types[index] === 'address') {
      arg = ADDRESS_PREFIX + arg.substr(2).toLowerCase();
    }
    obj.push(arg);
    return obj;
  }, []);
};

const toTronTransaction = async (txn: ConfirmedTransaction): Promise<TronTransaction> => {
  if (isNativeTransfer(txn)) {
    return await nativeTransferTxn(txn);
  }
  if (isContractInteraction(txn)) {
    return await nonNativeTransferTxn(txn);
  }
  return null;
};

export const isTronWalletAddress = (address: string): boolean => {
  return Tron.isAddress(address);
};

const nativeTransferTxn = async (txn: ConfirmedTransaction): Promise<TronTransaction> => {
  const { ret, txID, raw_data } = txn;
  const status = ret[0].contractRet;
  const from = raw_data.contract[0].parameter.value.owner_address;
  const to = raw_data.contract[0].parameter.value.to_address;
  const amount = raw_data.contract[0].parameter.value.amount;
  const { blockTimeStamp } = await Tron.trx.getTransactionInfo(txID);
  return {
    txID,
    from: TronWeb.address.fromHex(from),
    to: TronWeb.address.fromHex(to),
    amount: Number(parseFloat(ethers.utils.formatUnits(amount, TRON_NATIVE_DECIMAL))),
    status: TronStatus[status],
    isNative: true,
    createdAt: moment.utc(blockTimeStamp).toDate(),
  };
};

const nonNativeTransferTxn = async (txn: ConfirmedTransaction): Promise<TronTransaction> => {
  const { log: logs, blockTimeStamp } = await Tron.trx.getUnconfirmedTransactionInfo(txn.txID);
  const tranferLog = (logs ?? []).filter((log) => log.topics.length === 3 && log.topics[0] === TRANSFER_EVENT)?.[0];
  if (!tranferLog) {
    return null;
  }

  const status = txn.ret[0].contractRet;
  const contractAddress = contractToBase58(tranferLog.address);
  const from = convertLogToBase58(tranferLog.topics[1]);
  const to = convertLogToBase58(tranferLog.topics[2]);
  const amount = decodeParams(['uint256'], `0x${tranferLog.data}`, true)[0];
  const contract = await Tron.contract().at(contractAddress);
  const decimals = await wrap(`tron_decimal_${contractAddress}`, async () => await contract.decimals().call());
  return {
    contractAddress,
    txID: txn.txID,
    from,
    to,
    amount: Number(parseFloat(ethers.utils.formatUnits(amount, decimals))),
    isNative: false,
    status: TronStatus[status],
    createdAt: moment.utc(blockTimeStamp).toDate(),
  };
};

export const getTronBalance = async (
  provider: any,
  walletAddress: string,
  contractAddress: string
): Promise<string> => {
  const contract = await provider.contract().at(contractAddress);
  const [balance, decimal] = await Promise.all([contract.balanceOf(walletAddress).call(), contract.decimals().call()]);
  return ethers.utils.formatUnits(balance, decimal);
};

export const getTronTransaction = async (txnId: string): Promise<TronTransaction | null> => {
  try {
    const confirmedTransaction = await getConfirmedTransaction(txnId);

    if (!confirmedTransaction) {
      return null;
    }

    return await toTronTransaction(confirmedTransaction);
  } catch (error) {
    logger.error('get-tron-txn-error', error);
    throw error;
  }
};

export const toHex = (obj: any): string => {
  return Tron.toHex(obj);
};

export const verifyMessage = (message: string, signature: string, address: string): Promise<boolean> => {
  return Tron.trx.verifyMessage(message, signature, address);
};

export const verifyMessageV2 = (message: string, signature: string): Promise<string> => {
  return Tron.trx.verifyMessageV2(message, signature);
};
