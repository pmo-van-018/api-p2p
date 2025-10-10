import { AppealWinner } from '@api/common/types/Common';
import { OrderStatus } from '@api/order/models/Order';

export class ServiceOrderHelper {
  public static getOrderStatusState(orderStatusNumber: number) {
    let orderStatus = null;
    switch (orderStatusNumber) {
      case OrderStatus.COMPLETED:
        orderStatus = 'Hoàn thành';
        break;
      case OrderStatus.CANCELLED:
        orderStatus = 'Đã hủy';
        break;
      default:
        orderStatus = '';
        break;
    }
    return orderStatus;
  }
  public static getAppealWinner(row: AppealWinner) {
    if (row?.appeal_user_winner_id) {
      return 'Người dùng';
    } else if (row?.appeal_operation_winner_id) {
      return 'Thương gia';
    } else {
      return '';
    }
  }
}
