import moment from 'moment';

import { BUY_ORDER_STEPS, Order, OrderStatus, SELL_ORDER_STEP } from '@api/order/models/Order';
import { TradeType } from '@api/common/models/P2PEnum';

import { AppealResponse } from '@api/appeal/responses/AppealResponse';

export class OrderListDetailResponse {
  public id: string;
  public orderId: string;
  public createdTime: Date;
  public step: string;
  public timeout?: number;
  public orderRefId: string;
  public status: string;
  public amount: number;
  public requestAmount: number;
  public requestTotalPrice: number;
  public price: number;
  public totalPrice: number;
  public assetName: string;
  public assetNetwork: string;
  public fiatName: string;
  public fiatSymbol: string;
  public postType: string;
  public type: string;

  public roomId: string;
  public appeal: AppealResponse;
  public transCode: string;
  public completedTime: Date;
  public endedTime: Date;

  constructor(order: Order) {
    this.id = order.refId;
    this.orderId = order.id;
    this.orderRefId = order.refId;
    this.createdTime = order.createdTime;
    this.status = OrderStatus[order.status];
    this.step = this.getStep(order);
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
    this.roomId = order.roomId;
    this.appeal = order.appeal ? new AppealResponse(order.appeal, order.type) : null;
    this.completedTime = order.completedTime;
    this.endedTime = order.endedTime;
    this.transCode = order.transCode;
    if (order.status === OrderStatus.CANCELLED) {
      this.requestAmount = order.requestAmount;
      this.requestTotalPrice = order.requestTotalPrice;
    }
  }

  protected getStep(order: Order) {
    return order.type === TradeType.BUY ? BUY_ORDER_STEPS[order.step] : SELL_ORDER_STEP[order.step];
  }
}
