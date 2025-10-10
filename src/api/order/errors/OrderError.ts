import { ErrorInfo, ErrorType } from '@api/infrastructure/helpers/ErrorInfo';

export class OrderError {
  public static ORDER_NOT_FOUND: ErrorInfo = {
    key: 'ORDER_NOT_FOUND',
    message: 'Order not found',
    type: ErrorType.NOT_FOUND,
  };
  public static GET_ORDER_DETAIL_FAIL: ErrorInfo = {
    key: 'GET_ORDER_DETAIL_FAIL',
    message: 'Operation get order detail failed',
    type: ErrorType.INTERNAL_SERVER,
  };
  public static REPORT_PERMISSION_DENIED: ErrorInfo = {
    key: 'REPORT_PERMISSION_DENIED',
    message: 'Permission denied',
    type: ErrorType.BAD_REQUEST,
  };
  public static REPORT_TIME_INVALID: ErrorInfo = {
    key: 'REPORT_TIME_INVALID',
    message: 'Time selected invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static TOKEN_IS_NO_LONGER_SUPPORTED: ErrorInfo = {
    key: 'TOKEN_IS_NO_LONGER_SUPPORTED',
    message: 'Token is no longer supported',
    type: ErrorType.BAD_REQUEST,
  };
  public static ORDER_TYPE_IS_INVALID: ErrorInfo = {
    key: 'ORDER_TYPE_IS_INVALID',
    message: 'Order type is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static ORDER_TYPE_IS_REQUIRED: ErrorInfo = {
    key: 'ORDER_TYPE_IS_REQUIRED',
    message: 'Order type is required',
    type: ErrorType.BAD_REQUEST,
  };
  public static FILTER_BY_TIME_IS_REQUIRED: ErrorInfo = {
    key: 'FILTER_BY_TIME_IS_REQUIRED',
    message: 'Filter by time is required',
    type: ErrorType.BAD_REQUEST,
  };
  public static FILTER_BY_TIME_IS_INVALID: ErrorInfo = {
    key: 'FILTER_BY_TIME_IS_INVALID',
    message: 'Filter by time is invalid',
    type: ErrorType.BAD_REQUEST,
  };
}
