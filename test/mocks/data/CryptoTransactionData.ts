import {CryptoTransaction, TransactionStatus} from '../../../src/api/models';
import moment from 'moment';

export const cryptoTransactionData: CryptoTransaction[] = [];

export type CryptoTransactionMockDataType = {
  orderId: string,
  hash: string,
  status: TransactionStatus,
  id?: number,
};

export const mockCryptoTransaction = ({
  orderId,
  hash,
  status,
  id,
  }: CryptoTransactionMockDataType) => {
  const cryptoTransaction = new CryptoTransaction();
  cryptoTransaction.id = id ? id : cryptoTransactionData.length + 1;
  cryptoTransaction.orderId = orderId;
  cryptoTransaction.hash = hash;
  cryptoTransaction.status = status;
  cryptoTransaction.createdAt = moment.utc().toDate();
  cryptoTransaction.updatedAt = moment.utc().toDate();
  cryptoTransactionData.push(cryptoTransaction);
  return cryptoTransaction;
};
