import { Order } from '@api/order/models/Order';
import { UserInfoResponse } from '@api/profile/responses/UserInfoResponse';
import { OperationInfoResponse } from '@api/profile/responses/OperationInfoResponse';
import { OperationBaseOrderResponse } from '@api/order/responses/Orders/Operation';

export class OrderInfoResponse extends OperationBaseOrderResponse {
  public user: UserInfoResponse;
  public manager: OperationInfoResponse;

  constructor(order: Order) {
    super(order);
    delete this.appeal;

    this.user = new UserInfoResponse(order.user);
    this.manager = new OperationInfoResponse(order.merchant?.merchantManager);
  }
}
