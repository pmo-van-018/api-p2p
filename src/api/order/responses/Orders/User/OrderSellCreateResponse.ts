import { Order } from '@api/order/models/Order';
import { UserOrderInfoResponse } from '@api/order/responses/Orders/User';

export class OrderSellCreateResponse extends UserOrderInfoResponse {
  constructor(order: Order) {
    super(order);
  }
}
