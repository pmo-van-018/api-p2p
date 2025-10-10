import { OperationBaseOrderResponse } from '@api/order/responses/Orders/Operation/index';
import { Order } from '@api/order/models/Order';
import { PaginationResult } from '@api/common/types';

class OrderInfoResponse extends OperationBaseOrderResponse {
  constructor(order: Order) {
    super(order);
    delete this.user;
    delete this.merchant;
    delete this.transactions;
    delete this.appeal;
    delete this.createdTime;
    delete this.endedTime;
    delete this.step;
  }
}
export class HistoriesOrderListResponse {
  public orders: OrderInfoResponse[];
  public total: number;

  constructor(data: PaginationResult<Order>) {
    this.orders = data.items.map((order) => new OrderInfoResponse(order));
    this.total = data.totalItems;
  }
}
