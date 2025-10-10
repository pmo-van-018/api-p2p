import { Appeal } from '@api/appeal/models/Appeal';
import { AppealInfoResponse } from '@api/appeal/responses/AppealInfoResponse';
import { Order} from '@api/order/models/Order';
import { PaymentMethodResponse } from '@api/payment/responses/PaymentMethodResponse';
import _orderBy from 'lodash/orderBy';
import { CryptoTransaction, TransactionStatus } from '@api/order/models/CryptoTransaction';
import { OrderAppealResponse } from '@api/appeal/responses/OrderAppealResponse';

type TransactionResponse = {
  hash: string,
  status: string,
};

export class AppealDetailOrderInfo extends  OrderAppealResponse {
  public createdTime: Date;
  public feePercent: number;
  public penaltyFeePercent: number;
  public totalFee: number;
  public totalPenaltyFee: number;
  public bankAccountName: string;
  public bankNumber: string;
  public bankName: string;
  public transCode: string;
  public transaction: TransactionResponse;
  public roomId?: string;

  constructor(order: Order) {
    super(order);
    this.createdTime = order.createdTime;
    this.feePercent = order.fee;
    this.penaltyFeePercent = order.penaltyFee;
    this.totalFee = order.totalFee;
    this.totalPenaltyFee = order.totalPenaltyFee;
    this.roomId = order.roomId;
    if (order.paymentMethod) {
      const paymentMethod = new PaymentMethodResponse(order.paymentMethod);
      this.bankAccountName = paymentMethod.bankHolder;
      this.bankNumber = paymentMethod.bankNumber;
      this.bankName = paymentMethod.bankName;
      this.transCode = order.transCode;
    }
    this.transaction = getLastCryptoTransaction(order.cryptoTransactions);
  }
}

export class AppealDetailResponse extends AppealInfoResponse {
  public order: AppealDetailOrderInfo;
  public addExtraAt: Date;
  public completedAt?: Date;
  public evidentAt: Date;
  public decisionAt: Date;

  constructor(appeal: Appeal) {
    super(appeal);
    this.decisionAt = appeal.decisionAt;
    this.addExtraAt = appeal.addExtraAt;
    this.completedAt = appeal.completedAt;
    this.order = new AppealDetailOrderInfo(appeal.order);
  }
}

function getLastCryptoTransaction(transactions: CryptoTransaction[]) {
  return transactions?.length > 0
    ? _orderBy(transactions, ['createdAt'], ['desc']).map(
      (item) => ({ hash: item.hash, status: TransactionStatus[item.status], network: item.network })
    )[0]
    : undefined;
}
