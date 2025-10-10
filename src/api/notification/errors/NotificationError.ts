import { ErrorInfo, ErrorType } from '@api/infrastructure/helpers/ErrorInfo';

export class NotificationError {
  public static NOTIFICATION_NOT_FOUND: ErrorInfo = {
    key: 'NOTIFICATION_NOT_FOUND',
    message: 'Notification not found',
    type: ErrorType.NOT_FOUND,
  };
  public static GET_NOTIFICATION_DETAIL_FAIL: ErrorInfo = {
    key: 'GET_NOTIFICATION_DETAIL_FAIL',
    message: 'Operation get notification detail failed',
    type: ErrorType.INTERNAL_SERVER,
  };
}
