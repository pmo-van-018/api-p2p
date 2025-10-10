import { ErrorInfo, ErrorType } from '@api/infrastructure/helpers/ErrorInfo';

export class ValidateError {
  public static PLAYER_ID_IS_INVALID: ErrorInfo = {
    key: 'PLAYER_ID_IS_INVALID',
    message: 'Player id is invalid',
    type: ErrorType.NOT_FOUND,
  };
  public static NOTIFICATION_TYPE_INVALID: ErrorInfo = {
    key: 'NOTIFICATION_TYPE_INVALID',
    message: 'Notification type is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static NOTIFICATION_STATUS_INVALID: ErrorInfo = {
    key: 'NOTIFICATION_STATUS_INVALID',
    message: 'Notification status is invalid',
    type: ErrorType.BAD_REQUEST,
  };
}
