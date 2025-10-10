import { ErrorInfo, ErrorType } from '@api/infrastructure/helpers/ErrorInfo';

export class ValidateError {
  public static SUPPORT_TYPE_IS_INVALID: ErrorInfo = {
    key: 'SUPPORT_TYPE_IS_INVALID',
    message: 'Support type is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static SUPPORT_REQUEST_STATUS_IS_INVALID: ErrorInfo = {
    key: 'SUPPORT_REQUEST_STATUS_IS_INVALID',
    message: 'Support request status is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static DATE_IS_INVALID: ErrorInfo = {
    key: 'DATE_IS_INVALID',
    message: 'Date is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static SEARCH_TYPE_INVALID: ErrorInfo = {
    key: 'SEARCH_TYPE_INVALID',
    message: 'Search type is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static SORT_FIELD_INVALID: ErrorInfo = {
    key: 'SORT_FIELD_INVALID',
    message: 'Sort field is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static SORT_TYPE_INVALID: ErrorInfo = {
    key: 'SORT_TYPE_INVALID',
    message: 'Sort type is invalid',
    type: ErrorType.BAD_REQUEST,
  };
}
