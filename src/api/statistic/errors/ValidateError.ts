import { ErrorInfo, ErrorType } from '@api/infrastructure/helpers/ErrorInfo';

export class ValidateError {
  public static DATE_IS_INVALID: ErrorInfo = {
    key: 'DATE_IS_INVALID',
    message: 'date is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static DATE_IS_REQUIRED: ErrorInfo = {
    key: 'DATE_IS_REQUIRED',
    message: 'date is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static FROM_DATE_INVALID: ErrorInfo = {
    key: 'FROM_DATE_INVALID',
    message: 'From date is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static TO_DATE_INVALID: ErrorInfo = {
    key: 'TO_DATE_INVALID',
    message: 'To date is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static FROM_DATE_REQUIRED: ErrorInfo = {
    key: 'FROM_DATE_REQUIRED',
    message: 'From date is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static TO_DATE_REQUIRED: ErrorInfo = {
    key: 'TO_DATE_REQUIRED',
    message: 'To date is required',
    type: ErrorType.BAD_REQUEST,
  };
  public static GROUP_TYPE_INVALID: ErrorInfo = {
    key: 'GROUP_TYPE_INVALID',
    message: 'Group type is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static GROUP_TYPE_REQUIRED: ErrorInfo = {
    key: 'GROUP_TYPE_REQUIRED',
    message: 'Group type is required',
    type: ErrorType.BAD_REQUEST,
  };
  public static TRADE_TYPE_INVALID: ErrorInfo = {
    key: 'TRADE_TYPE_INVALID',
    message: 'Trade type is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static REPORT_TYPE_INVALID: ErrorInfo = {
    key: 'REPORT_TYPE_INVALID',
    message: 'Report type is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static REPORT_TYPE_REQUIRED: ErrorInfo = {
    key: 'REPORT_TYPE_REQUIRED',
    message: 'Report type is required',
    type: ErrorType.BAD_REQUEST,
  };
  public static ASSET_ID_LIST_INVALID: ErrorInfo = {
    key: 'ASSET_ID_LIST_INVALID',
    message: 'Asset id list is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static FILE_FORMAT_INVALID: ErrorInfo = {
    key: 'FILE_FORMAT_INVALID',
    message: 'File format is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static FILE_FORMAT_REQUIRED: ErrorInfo = {
    key: 'FILE_FORMAT_REQUIRED',
    message: 'File format is required',
    type: ErrorType.BAD_REQUEST,
  };
  public static MANAGER_ID_LIST_INVALID: ErrorInfo = {
    key: 'MANAGER_ID_LIST_INVALID',
    message: 'Manager id list is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static USER_ID_INVALID: ErrorInfo = {
    key: 'USER_ID_INVALID',
    message: 'User id is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static STAFF_TYPE_INVALID: ErrorInfo = {
    key: 'STAFF_TYPE_INVALID',
    message: 'Staff type is invalid',
    type: ErrorType.BAD_REQUEST,
  };
}
