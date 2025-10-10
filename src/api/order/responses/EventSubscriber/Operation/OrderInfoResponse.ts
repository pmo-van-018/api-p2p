import { OperationOrderInfoResponse } from '@api/order/responses/Orders/Operation';
import { Order } from '@api/order/models/Order';

export class OrderInfoResponse extends OperationOrderInfoResponse {
  constructor(order: Order) {
    super(order);
  }
}
