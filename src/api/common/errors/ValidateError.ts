import { ErrorInfo, ErrorType } from '@api/infrastructure/helpers/ErrorInfo';
export class ValidateError {
  public static LIMIT_INVALID: ErrorInfo = {
    key: 'LIMIT_INVALID',
    message: 'Limit is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static PAGE_INVALID: ErrorInfo = {
    key: 'PAGE_INVALID',
    message: 'Page is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static DATE_RANGE_IS_INVALID: ErrorInfo = {
    key: 'DATE_RANGE_IS_INVALID',
    message: 'Date range is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static DATE_IS_INVALID: ErrorInfo = {
    key: 'DATE_IS_INVALID',
    message: 'Date is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static RESULT_IS_INVALID: ErrorInfo = {
    key: 'RESULT_IS_INVALID',
    message: 'Result is invalid',
    type: ErrorType.BAD_REQUEST,
  };
}
