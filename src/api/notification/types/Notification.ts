import {NotificationStatus, NotificationType} from '@api/common/models/P2PEnum';

export type NotificationQuery = {
  status?: NotificationStatus;
  type?: NotificationType;
  operationId?: string;
  userId?: string;
  limit: number;
  page: number;
};

export type NotificationMessage = {
  notificationCase?: string;
  transactionId?: string;
  transactionType?: string;
  username?: string;
  amount?: number | string;
  currency?: string;
  type: NotificationType;
  datetime?: Date | string;
  bankName?: string;
  walletAddress?: string;
  merchantId?: string;
  merchantSupporterId?: string;
  appealId?: string;
  endUserId?: string;
  merchantManagerId?: string;
  link?: string;
  adminId?: string;
  orderIds?: string[] | number[];
  merchantWalletAddress?: string;
  merchantManagerWalletAddress?: string;
  transactionIds?: string;
  transactionRefId?: string;
  assetNetworks?: string;
  operatorName?: string;
  oldWalletAddress?: string;
  newWalletAddress?: string;
  managerProfileId?: string;
  oldValue?: number;
  newValue?: number;
  assetBalances?: string;
};

export type BalanceConfigurationData = {
  assetId: string;
  balance: number;
  oldBalance: number;
};
