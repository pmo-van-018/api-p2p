import { TransactionStatus } from '../models/CryptoTransaction';

export const TronStatus = {
  'PENDING': 1,
  'SUCCESS': 2,
  'FAILED': 3,
};
export interface ConfirmedTransaction {
  raw_data: any;
  ret: any;
  txID: string;
}

export interface TronTransaction {
  txID: string;
  contractAddress?: string;
  from: string;
  to: string;
  amount: number;
  status: TransactionStatus;
  isNative: boolean;
  createdAt: Date;
}
