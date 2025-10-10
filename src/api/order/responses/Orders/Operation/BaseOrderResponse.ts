import { TradeType } from '@api/common/models/P2PEnum';
import { BUY_ORDER_STEPS, Order, OrderStatus, SELL_ORDER_STEP } from '@api/order/models/Order';
import moment from 'moment';
import { AppealResponse } from '@api/appeal/responses/AppealResponse';
import { CryptoTransactionResponse } from '@api/order/responses/Orders';
import { PaymentMethodResponse } from '@api/payment/responses/PaymentMethodResponse';
import { formatBankNumber } from '@base/utils/string.utils';
import { User } from '@api/profile/models/User';
import { Operation } from '@api/profile/models/Operation';
import { getQrcodeUrl } from '@base/utils/bank-qr.utils';
import { InfoSupporterBaseResponse } from '@api/profile/responses/ListSupporterBaseResponse';
import _orderBy from 'lodash/orderBy';

class UserInfoResponse {
  public walletAddress: string;
  public nickName: string;
  constructor(user: User) {
    this.nickName = user.nickName;
    this.walletAddress = user.walletAddress;
  }
}
class OperationInfoResponse {
  public walletAddress: string;
  public nickName: string;
  constructor(operation: Operation) {
    this.nickName = operation.nickName;
    this.walletAddress = operation.walletAddress;
  }
}
export class BaseOrderResponse {
  public id: string;
  public orderId: string;
  public orderRefId: string;
  public postRefId: string;
  public createdTime: Date;
  public status: string;
  public step: string;
  public timeout?: number;
  public amount: number;
  public price: number;
  public totalPrice: number;
  public assetName: string;
  public assetNetwork: string;
  public fiatName: string;
  public fiatSymbol: string;
  public type: string;
  public postType: string;
  public feePercent: number;
  public penaltyFeePercent: number;
  public totalFee: number;
  public totalPenaltyFee: number;
  public bankAccountName: string;
  public bankNumber: string;
  public bankName: string;
  public bankQrCode: string;
  public note: string;

  public transactions: CryptoTransactionResponse[];
  public appeal: AppealResponse;
  public transCode: string;
  public completedTime: Date;
  public endedTime: Date;
  public updatedTime: Date;
  public user: UserInfoResponse;
  public merchant: OperationInfoResponse;
  public supporter: InfoSupporterBaseResponse;
  public appealResolved: boolean;
  public roomId: string;

  constructor(order: Order) {
    this.id = order.refId;
    this.orderId = order.id;
    this.orderRefId = order.refId;
    this.createdTime = order.createdTime;
    this.status = OrderStatus[order.status];
    this.step = order.type === TradeType.BUY ? BUY_ORDER_STEPS[order.step] : SELL_ORDER_STEP[order.step];
    let timeoutSeconds = moment(order.endedTime).utc().diff(moment.utc(), 'seconds');
    if (timeoutSeconds <= 0) {
      timeoutSeconds = null;
    }
    this.timeout = order.hasCountdownTimer() ? timeoutSeconds : null;
    this.amount = order.amount;
    this.price = order.price;
    this.totalPrice = order.totalPrice;
    this.assetName = order.asset.name;
    this.assetNetwork = order.asset.network;
    this.fiatName = order.fiat.name;
    this.fiatSymbol = order.fiat.symbol;
    this.type = order.type;
    this.postType = order.post.type;
    this.transactions =
      order.cryptoTransactions?.length > 0
        ? [
            _orderBy(order.cryptoTransactions, ['createdAt'], ['desc']).map(
              (item) =>
                new CryptoTransactionResponse({
                  transaction: item,
                  orderType: order.type,
                  orderStep: order.step,
                })
            )[0],
          ]
        : [];
    this.roomId = order.roomId;
    this.appeal = order.appeal ? new AppealResponse(order.appeal, order.type) : null;
    this.postRefId = order.post?.refId;
    this.transCode = order.transCode;
    this.completedTime = order.completedTime;
    this.updatedTime = order.updatedAt;
    this.endedTime = order.endedTime;
    this.feePercent = order.fee;
    this.penaltyFeePercent = order.penaltyFee;
    this.totalFee = order.totalFee;
    this.totalPenaltyFee = order.totalPenaltyFee;
    this.user = new UserInfoResponse(order.user);
    this.merchant = new OperationInfoResponse(order.merchant);
    if (order?.supporter) {
      this.supporter = new InfoSupporterBaseResponse(order?.supporter);
    }
    this.appealResolved = order.appealResolved;
    if (![OrderStatus.CANCELLED, OrderStatus.COMPLETED].includes(order.status)) {
      const paymentMethod = new PaymentMethodResponse(order.paymentMethod);
      this.bankAccountName = paymentMethod.bankHolder;
      this.bankNumber = order.type === TradeType.BUY ? formatBankNumber(paymentMethod.bankNumber) : paymentMethod.bankNumber;
      this.bankName = paymentMethod.bankName;
      if (order.type !== TradeType.BUY) {
        this.bankQrCode = getQrcodeUrl({
          name: this.bankName,
          number: this.bankNumber,
          amount: this.totalPrice,
          note: order.transCode,
        });
      }
    }
  }
}
