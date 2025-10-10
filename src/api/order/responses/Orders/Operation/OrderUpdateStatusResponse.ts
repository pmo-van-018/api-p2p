import { BUY_ORDER_STEPS, Order, OrderStatus, SELL_ORDER_STEP } from '@api/order/models/Order';
import { TradeType } from '@api/common/models';

export class OrderUpdateStatusResponse {
  public orderId: string;
  public status: string;
  public step: string;
  constructor(order: Order) {
    this.orderId = order.id;
    this.status = OrderStatus[order.status];
    this.step = order.type === TradeType.BUY ? BUY_ORDER_STEPS[order.step] : SELL_ORDER_STEP[order.step];
  }
}
