import { Order } from '@api/order/models/Order';
import { UserOrderInfoBaseResponse } from '@api/order/responses/Orders/User';

export class OrderInfoResponse extends UserOrderInfoBaseResponse {
  public requestAmount: number;
  public requestTotalPrice: number;
  constructor(order: Order) {
    super(order);
    this.requestAmount = order.requestAmount;
    this.requestTotalPrice = order.requestTotalPrice;
  }
}
