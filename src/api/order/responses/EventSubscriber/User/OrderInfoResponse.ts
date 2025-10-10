import { UserOrderInfoBaseResponse } from '@api/order/responses/Orders/User';
import { Order } from '@api/order/models/Order';
import { AppealResponse } from '@api/appeal/responses/AppealResponse';
import moment from 'moment';

export class OrderInfoResponse extends UserOrderInfoBaseResponse {
  public appeal: AppealResponse;
  public retryTime: number;
  constructor(order: Order, retryTime?: number) {
    super(order);
    let timeoutSeconds = moment(order.endedTime).utc().diff(moment.utc(), 'seconds');
    if (timeoutSeconds <= 0) {
      timeoutSeconds = null;
    }
    this.appeal = order.appeal ? new AppealResponse(order.appeal, order.type) : null;
    this.completedTime = order.completedTime;
    this.endedTime = order.endedTime;
    this.retryTime = retryTime;
  }
}
