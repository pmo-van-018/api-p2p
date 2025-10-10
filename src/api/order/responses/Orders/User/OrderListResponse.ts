import { Order } from '@api/order/models/Order';
import { PaginationResult } from '@api/common/types';
import { UserOrderListDetailResponse } from '@api/order/responses/Orders/User';

export class OrderListResponse {
  public orders: UserOrderListDetailResponse[];
  public total: number;

  constructor(data: PaginationResult<Order>) {
    this.orders = data.items.map((order) => new UserOrderListDetailResponse(order));
    this.total = data.totalItems;
  }
}
