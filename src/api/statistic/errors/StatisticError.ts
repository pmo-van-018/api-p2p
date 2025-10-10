import { ErrorInfo, ErrorType } from '@api/infrastructure/helpers/ErrorInfo';

export class StatisticError {
  public static REPORT_TIME_INVALID: ErrorInfo = {
    key: 'REPORT_TIME_INVALID',
    message: 'Time selected invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static USER_NOT_FOUND: ErrorInfo = {
    key: 'USER_NOT_FOUND',
    message: 'User not found',
    type: ErrorType.NOT_FOUND,
  };
  public static REPORT_PERMISSION_DENIED: ErrorInfo = {
    key: 'REPORT_PERMISSION_DENIED',
    message: 'Permission denied',
    type: ErrorType.BAD_REQUEST,
  };
}
