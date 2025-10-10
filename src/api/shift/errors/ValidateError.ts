import { ErrorInfo, ErrorType } from '@api/infrastructure/helpers/ErrorInfo';

export class ValidateError {
  public static ASSET_ID_INVALID: ErrorInfo = {
    key: 'ASSET_ID_INVALID',
    message: 'Asset id is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static ASSET_ID_REQUIRED: ErrorInfo = {
    key: 'ASSET_ID_REQUIRED',
    message: 'Asset id is required',
    type: ErrorType.BAD_REQUEST,
  };
  public static BALANCE_INVALID: ErrorInfo = {
    key: 'BALANCE_INVALID',
    message: 'Balance is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static BALANCE_REQUIRED: ErrorInfo = {
    key: 'BALANCE_REQUIRED',
    message: 'Balance is required',
    type: ErrorType.BAD_REQUEST,
  };
  public static ASSET_BALANCE_REQUIRED: ErrorInfo = {
    key: 'ASSET_BALANCE_REQUIRED',
    message: 'Asset balances is required',
    type: ErrorType.BAD_REQUEST,
  };
  public static DATE_IS_INVALID: ErrorInfo = {
    key: 'DATE_IS_INVALID',
    message: 'Date is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static DATE_RANGE_IS_INVALID: ErrorInfo = {
    key: 'DATE_RANGE_IS_INVALID',
    message: 'Date range is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static FILTER_DATE_TYPE_IS_INVALID: ErrorInfo = {
    key: 'FILTER_DATE_TYPE_IS_INVALID',
    message: 'Filter date type is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static SEARCH_TYPE_IS_INVALID: ErrorInfo = {
    key: 'SEARCH_TYPE_IS_INVALID',
    message: 'Search type is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static STATUS_IS_INVALID: ErrorInfo = {
    key: 'STATUS_IS_INVALID',
    message: 'Status is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static ORDER_FIELD_IS_INVALID: ErrorInfo = {
    key: 'ORDER_FIELD_IS_INVALID',
    message: 'Order field is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static ORDER_DIRECTION_IS_INVALID: ErrorInfo = {
    key: 'ORDER_DIRECTION_IS_INVALID',
    message: 'Order direction is invalid',
    type: ErrorType.BAD_REQUEST,
  };
}
