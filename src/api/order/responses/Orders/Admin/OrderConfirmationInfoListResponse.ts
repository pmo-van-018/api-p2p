import { Order } from '@api/order/models/Order';
import { OrderConfirmationInfoResponse } from './OrderConfirmationInfoResponse';

export class OrderConfirmationInfoListResponse {
  public orders: OrderConfirmationInfoResponse[];

  constructor(orders: Order[]) {
    this.orders = orders.map((order) => new OrderConfirmationInfoResponse(order));
  }
}
