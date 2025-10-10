import moment from 'moment';

import { BUY_ORDER_STEPS, Order, OrderStatus, SELL_ORDER_STEP } from '@api/order/models/Order';
import { TradeType } from '@api/common/models/P2PEnum';

import { AppealResponse } from '@api/appeal/responses/AppealResponse';
import { PaymentMethodResponse } from '@api/payment/responses/PaymentMethodResponse';
import { CryptoTransactionResponse } from '@api/order/responses/Orders';
import { User } from '@api/profile/models/User';
import { Operation } from '@api/profile/models/Operation';
import { getQrcodeUrl } from '@base/utils/bank-qr.utils';
import _orderBy from 'lodash/orderBy';
import { SELL_ORDER_MAX_RETRY_SEND_CRYPTO } from '@api/common/models/P2PConstant';
import { TransactionStatus } from '@api/order/models/CryptoTransaction';
import { CryptoTransactionError } from '@api/order/errors/CryptoTransactionError';

class UserInfoResponse {
  public walletAddress: string;
  constructor(user: User) {
    this.walletAddress = user.walletAddress;
  }
}
class OperationInfoResponse {
  public walletAddress: string;
  constructor(operation: Operation) {
    this.walletAddress = operation.walletAddress;
  }
}

export class OrderInfoBaseResponse {
  public id: string;
  public orderId: string;
  public orderRefId: string;
  public createdTime: Date;
  public step: string;
  public timeout?: number;
  public status: string;
  public amount: number;
  public price: number;
  public totalPrice: number;
  public assetName: string;
  public assetNetwork: string;
  public fiatName: string;
  public fiatSymbol: string;
  public postType: string;
  public type: string;

  public bankAccountName: string;
  public bankNumber: string;
  public bankName: string;
  public bankQrCode: string;
  public note: string;
  public managerName: string;

  public transactions: CryptoTransactionResponse[];
  public appeal: AppealResponse;
  public roomId: string;
  public transCode: string;
  public completedTime: Date;
  public endedTime: Date;
  public updatedTime: Date;
  public user: UserInfoResponse;
  public merchant: OperationInfoResponse;
  public cancelReason: string;

  constructor(order: Order) {
    this.id = order.refId;
    this.orderId = order.id;
    this.orderRefId = order.refId;
    this.createdTime = order.createdTime;
    this.updatedTime = order.updatedAt;
    this.status = OrderStatus[order.status];
    this.step = this.getStep(order);
    this.note = order.post.note;
    this.managerName = order.merchant.merchantManager.nickName;
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
    this.postType = order.post.type;
    this.type = order.type;
    if (order.paymentMethod && ![OrderStatus.COMPLETED, OrderStatus.CANCELLED].includes(order.status)) {
      const paymentMethod = new PaymentMethodResponse(order.paymentMethod);
      this.bankAccountName = paymentMethod.bankHolder;
      this.bankNumber = paymentMethod.bankNumber;
      this.bankName = paymentMethod.bankName;
      if (order.type === TradeType.BUY) {
        this.bankQrCode = getQrcodeUrl({
          name: this.bankName,
          number: this.bankNumber,
          amount: this.totalPrice,
          note: order.transCode,
        });
      }
    }
    this.roomId = order.roomId;
    this.appeal = order.appeal ? new AppealResponse(order.appeal, order.type) : null;
    this.transCode = order.transCode;
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
        ] : [];
    if (order.type === TradeType.SELL) {
      this.merchant = new OperationInfoResponse(order.merchant);
      this.user = new UserInfoResponse(order.user);
    }
    if (order.status === OrderStatus.CANCELLED
      && order.cryptoTransactions?.length >= SELL_ORDER_MAX_RETRY_SEND_CRYPTO
      && order.cryptoTransactions.every((item) => item.status === TransactionStatus.FAILED)) {
      this.cancelReason = CryptoTransactionError.TX_HASH_EXCEED_LIMIT.key;
    }
  }

  protected getStep(order: Order) {
    return order.type === TradeType.BUY ? BUY_ORDER_STEPS[order.step] : SELL_ORDER_STEP[order.step];
  }
}
