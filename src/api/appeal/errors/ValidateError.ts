import { ErrorInfo, ErrorType } from '@api/infrastructure/helpers/ErrorInfo';

export class ValidateError {
  public static APPEAL_ID_INVALID: ErrorInfo = {
    key: 'APPEAL_ID_INVALID',
    message: 'Appeal id is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static APPEAL_ID_REQUIRED: ErrorInfo = {
    key: 'APPEAL_ID_REQUIRED',
    message: 'Appeal id is required',
    type: ErrorType.BAD_REQUEST,
  };
  public static EXTRA_TIME_INVALID: ErrorInfo = {
    key: 'EXTRA_TIME_INVALID',
    message: 'Extra time is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static DECISION_RESULT_INVALID: ErrorInfo = {
    key: 'DECISION_RESULT_INVALID',
    message: 'Decision result is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static AMOUNT_INVALID: ErrorInfo = {
    key: 'AMOUNT_INVALID',
    message: 'Amount is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static ORDER_TYPE_INVALID: ErrorInfo = {
    key: 'ORDER_TYPE_INVALID',
    message: 'Order type is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static SUPPORTER_ID_INVALID: ErrorInfo = {
    key: 'SUPPORTER_ID_INVALID',
    message: 'Supporter id is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static ORDER_STATUS_INVALID: ErrorInfo = {
    key: 'ORDER_STATUS_INVALID',
    message: 'Order status is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static APPEAL_STATUS_INVALID: ErrorInfo = {
    key: 'APPEAL_STATUS_INVALID',
    message: 'Appeal status is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static SEARCH_FIELD_INVALID: ErrorInfo = {
    key: 'SEARCH_FIELD_INVALID',
    message: 'Search field is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static SEARCH_VALUE_INVALID: ErrorInfo = {
    key: 'SEARCH_VALUE_INVALID',
    message: 'Search value is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static SORT_FIELD_INVALID: ErrorInfo = {
    key: 'SORT_FIELD_INVALID',
    message: 'Sort field is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static SORT_DIRECTION_INVALID: ErrorInfo = {
    key: 'SORT_DIRECTION_INVALID',
    message: 'Sort direction is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static ORDER_ID_INVALID: ErrorInfo = {
    key: 'ORDER_ID_INVALID',
    message: 'Order id is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static ORDER_ID_REQUIRED: ErrorInfo = {
    key: 'ORDER_ID_REQUIRED',
    message: 'Order id is required',
    type: ErrorType.BAD_REQUEST,
  };
}
