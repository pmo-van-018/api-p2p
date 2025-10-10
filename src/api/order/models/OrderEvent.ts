import { BLOCKCHAIN_NETWORKS, TradeType } from '@api/common/models';
import { TransactionStatus } from '@api/order/models/CryptoTransaction';
import { Order } from '@api/order/models/Order';
import { BocRequestBodyDto } from '@api/order/requests/BocUpdateTicketRequest';
import { CONTENT_TYPE_BANK } from '@api/payment/models/PaymentMethodField';
import { env } from '@base/env';
import moment from 'moment';

class PaymentMethod {
  public bankHolder: string;
  public bankNumber: string;
  public bankName: string;
  public bankBranch: string;

  constructor(order: Order) {
    this.bankHolder = order?.paymentMethod?.getPaymentMethodField(CONTENT_TYPE_BANK.BANK_HOLDER);
    this.bankNumber = order?.paymentMethod?.getPaymentMethodField(CONTENT_TYPE_BANK.BANK_NUMBER);
    this.bankName = order?.paymentMethod?.getPaymentMethodField(CONTENT_TYPE_BANK.BANK_NAME);
    this.bankBranch = order?.paymentMethod?.getPaymentMethodField(CONTENT_TYPE_BANK.BANK_REMARK);
  }
}

class Asset {
  public name: string;
  public symbol: string;
  public network: BLOCKCHAIN_NETWORKS;

  constructor(order: Order) {
    this.name = order?.asset?.name;
    this.symbol = order?.asset?.symbol;
    this.network = order?.asset?.network;
  }
}

export enum OrderEventType {
  ORDER_COMPLETED = 'ORDER_COMPLETED',
}

export class CompletedOrderEvent {
  public orderId: string;
  public asset: Asset;
  public type: TradeType;
  public amountCrypto: number;
  public amountVND: number;
  public rate: number;
  public account: PaymentMethod;
  public createdAt: Date;
  public completedAt: Date;
  public sentAt: Date;
  public isPaymentFromAnotherAccount: boolean;

  constructor(order: Order) {
    this.orderId = order.refId;
    this.asset = new Asset(order);
    this.type = order.type;
    this.amountCrypto = order.amount;
    this.amountVND = order.totalPrice;
    this.rate = order.price;
    this.account = new PaymentMethod(order);
    this.createdAt = order.createdAt;
    this.completedAt = order.completedTime;
    this.sentAt = moment.utc().toDate();
    this.isPaymentFromAnotherAccount = order.isPaymentFromAnotherAccount;
  }
}

export class CompletedOrderEventV2 {
  public version: string;
  public orderId: string;
  public senderAddress: string;
  public senderName: string;
  public addressReceive: string;
  public transactionId: string;
  public amountCrypto: number;
  public rate: number;
  public network: string;
  public amountVND: number;
  public accountIdReceiveCrypto: string;
  public accountIdSendVND: string;
  public bankNumber: string;
  public bankName: string;
  public bankHolder: string;
  public createdAt: number;
  public updatedAt: number;
  public note: string;
  public processBy: string;
  public bocData?: BocRequestBodyDto;
  public orderType: TradeType;

  constructor(order: Order) {
    this.version = env.kafka.orders.version;
    this.orderId = order?.refId;
    this.senderAddress = order?.user?.walletAddress;
    this.senderName = order?.merchant?.nickName;
    this.addressReceive = order?.merchant?.walletAddress;
    this.transactionId = order?.cryptoTransactions?.find((tx) => tx?.status === TransactionStatus.SUCCEED)?.hash ?? '';
    this.amountCrypto = order?.amount;
    this.rate = order?.price;
    this.network = order?.asset?.network;
    this.amountVND = order?.totalPrice;
    this.accountIdReceiveCrypto = order?.merchant?.walletAddress ?? '';
    this.accountIdSendVND = order?.merchant?.refId ?? '';
    this.bankNumber = order?.paymentMethod?.getPaymentMethodField(CONTENT_TYPE_BANK.BANK_NUMBER) ?? '';
    this.bankName = order?.paymentMethod?.getPaymentMethodField(CONTENT_TYPE_BANK.BANK_NAME) ?? '';
    this.bankHolder = order?.paymentMethod?.getPaymentMethodField(CONTENT_TYPE_BANK.BANK_HOLDER) ?? '';
    this.createdAt = moment(order.createdAt).valueOf();
    this.updatedAt = moment(order.updatedAt).valueOf();
    this.note = order?.post?.note;
    this.processBy = order?.merchant?.nickName;
    this.bocData = order?.paymentTickets?.[0]?.payloadLog ? JSON.parse(order?.paymentTickets?.[0]?.payloadLog) : null;
    this.orderType = order?.type;
  }
}
