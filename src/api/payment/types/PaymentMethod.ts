export type BankGenQrCodeParams = {
  name: string;
  number: string;
  account?: string;
  note?: string;
  amount?: number;
};

export type NotificationDisablePayment = {
  walletAddress: string;
  userId: string;
  merchantManagerId?: string;
  bankName: string;
};

export type PaymentMethod = {
  id: string;
  bankName: string;
  bankNumber: string;
  bankHolder: string;
  bankRemark?: string;
  enable?: boolean;
};

export type PaymentMethodAvailability = {
  hasPost: boolean;
  hasOrder: boolean;
};

export type PaymentMethodOwner = {
  userId?: string;
  operationId?: string;
};
