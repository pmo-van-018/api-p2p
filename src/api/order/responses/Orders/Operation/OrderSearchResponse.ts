import { PaginationResult } from '@api/common/types';
import { Order } from '@api/order/models/Order';
import { OperationOrderInfoResponse } from '@api/order/responses/Orders/Operation';

export class OrderSearchResponse {
  public orders: OperationOrderInfoResponse[];
  public total: number;

  constructor(data: PaginationResult<Order>) {
    this.orders = data.items.map((order) => new OperationOrderInfoResponse(order));
    this.total = data.totalItems;
  }
}
