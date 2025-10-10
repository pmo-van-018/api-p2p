import { ErrorInfo, ErrorType } from '@api/infrastructure/helpers/ErrorInfo';

export class ValidateError {
  public static ALLOW_NOTIFICATION_LIST_INVALID: ErrorInfo = {
    key: 'ALLOW_NOTIFICATION_LIST_INVALID',
    message: 'Allow notification list is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static AVATAR_INVALID: ErrorInfo = {
    key: 'AVATAR_INVALID',
    message: 'Avatar is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static STAFF_STATUS_INVALID: ErrorInfo = {
    key: 'STAFF_STATUS_INVALID',
    message: 'Staff status is invalid',
    type: ErrorType.BAD_REQUEST,
  };
}
