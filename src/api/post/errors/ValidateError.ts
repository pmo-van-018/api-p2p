import { ErrorInfo, ErrorType } from '@api/infrastructure/helpers/ErrorInfo';
export class ValidateError {
  public static ASSET_NAME_REQUIRED: ErrorInfo = {
    key: 'ASSET_NAME_REQUIRED',
    message: 'Asset name is required.',
    type: ErrorType.BAD_REQUEST,
  };
  public static ASSET_NAME_INVALID: ErrorInfo = {
    key: 'ASSET_NAME_INVALID',
    message: 'Asset name is invalid.',
    type: ErrorType.BAD_REQUEST,
  };
  public static NETWORK_REQUIRED: ErrorInfo = {
    key: 'NETWORK_REQUIRED',
    message: 'Network is required.',
    type: ErrorType.BAD_REQUEST,
  };
  public static NETWORK_INVALID: ErrorInfo = {
    key: 'NETWORK_INVALID',
    message: 'Network is invalid.',
    type: ErrorType.BAD_REQUEST,
  };
  public static FIAT_REQUIRED: ErrorInfo = {
    key: 'FIAT_REQUIRED',
    message: 'Fiat is required.',
    type: ErrorType.BAD_REQUEST,
  };
  public static FIAT_INVALID: ErrorInfo = {
    key: 'FIAT_INVALID',
    message: 'Fiat is invalid.',
    type: ErrorType.BAD_REQUEST,
  };
  public static POST_TYPE_REQUIRED: ErrorInfo = {
    key: 'POST_TYPE_REQUIRED',
    message: 'Post type is required.',
    type: ErrorType.BAD_REQUEST,
  };
  public static MIN_AMOUNT_REQUIRED: ErrorInfo = {
    key: 'MIN_AMOUNT_REQUIRED',
    message: 'Min amount is required.',
    type: ErrorType.BAD_REQUEST,
  };
  public static MAX_AMOUNT_REQUIRED: ErrorInfo = {
    key: 'MAX_AMOUNT_REQUIRED',
    message: 'Max amount is required.',
    type: ErrorType.BAD_REQUEST,
  };
  public static POST_TYPE_INVALID: ErrorInfo = {
    key: 'POST_TYPE_INVALID',
    message: 'Post type is invalid.',
    type: ErrorType.BAD_REQUEST,
  };
  public static AMOUNT_POSITIVE: ErrorInfo = {
    key: 'AMOUNT_POSITIVE',
    message: 'Amount must be a positive number.',
    type: ErrorType.BAD_REQUEST,
  };
  public static AMOUNT_VALUE_EXCEED: ErrorInfo = {
    key: 'AMOUNT_VALUE_EXCEED',
    message: 'Amount max value is 999,999,999,999.',
    type: ErrorType.BAD_REQUEST,
  };
  public static MIN_AMOUNT_POSITIVE: ErrorInfo = {
    key: 'MIN_AMOUNT_POSITIVE',
    message: 'Min amount must be a positive number.',
    type: ErrorType.BAD_REQUEST,
  };
  public static MAX_AMOUNT_POSITIVE: ErrorInfo = {
    key: 'MAX_AMOUNT_POSITIVE',
    message: 'Max amount must be a positive number.',
    type: ErrorType.BAD_REQUEST,
  };
  public static MAX_AMOUNT_MUST_GREATER_THAN_MIN_AMOUNT: ErrorInfo = {
    key: 'MAX_AMOUNT_MUST_GREATER_THAN_MIN_AMOUNT',
    message: 'Max amount must be greater than min amount.',
    type: ErrorType.BAD_REQUEST,
  };
  public static MERCHANT_ID_INVALID: ErrorInfo = {
    key: 'MERCHANT_ID_INVALID',
    message: 'Merchant refer identity is invalid.',
    type: ErrorType.BAD_REQUEST,
  };
  public static MERCHANT_ID_REQUIRED: ErrorInfo = {
    key: 'MERCHANT_ID_REQUIRED',
    message: 'Merchant refer identity is required.',
    type: ErrorType.BAD_REQUEST,
  };
  public static POST_ID_INVALID: ErrorInfo = {
    key: 'POST_ID_INVALID',
    message: 'Post identity is invalid.',
    type: ErrorType.BAD_REQUEST,
  };
  public static POST_ID_REQUIRED: ErrorInfo = {
    key: 'POST_ID_REQUIRED',
    message: 'Post id is required',
    type: ErrorType.BAD_REQUEST,
  };
  public static ASSET_ID_INVALID: ErrorInfo = {
    key: 'ASSET_ID_INVALID',
    message: 'Asset id invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static ASSET_ID_REQUIRED: ErrorInfo = {
    key: 'ASSET_ID_REQUIRED',
    message: 'Asset id required',
    type: ErrorType.BAD_REQUEST,
  };
  public static ASSET_NAME_IS_STRING: ErrorInfo = {
    key: 'ASSET_NAME_IS_STRING',
    message: 'Asset name must be string',
    type: ErrorType.BAD_REQUEST,
  };
  public static ASSET_NAME_TOO_LONG: ErrorInfo = {
    key: 'ASSET_NAME_TOO_LONG',
    message: 'Asset name length too long',
    type: ErrorType.BAD_REQUEST,
  };
  public static ASSET_NETWORK_REQUIRED: ErrorInfo = {
    key: 'ASSET_NETWORK_REQUIRED',
    message: 'Asset network is required',
    type: ErrorType.BAD_REQUEST,
  };
  public static ASSET_NETWORK_IS_STRING: ErrorInfo = {
    key: 'ASSET_NETWORK_IS_STRING',
    message: 'Asset network must be string',
    type: ErrorType.BAD_REQUEST,
  };
  public static ASSET_NETWORK_TOO_LONG: ErrorInfo = {
    key: 'ASSET_NETWORK_TOO_LONG',
    message: 'Asset network length too long',
    type: ErrorType.BAD_REQUEST,
  };
  public static FIAT_ID_REQUIRED: ErrorInfo = {
    key: 'FIAT_ID_REQUIRED',
    message: 'Fiat id is required',
    type: ErrorType.BAD_REQUEST,
  };
  public static FIAT_ID_INVALID: ErrorInfo = {
    key: 'FIAT_ID_INVALID',
    message: 'Fiat id invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static FIAT_IS_STRING: ErrorInfo = {
    key: 'FIAT_IS_STRING',
    message: 'Fiat must be string',
    type: ErrorType.BAD_REQUEST,
  };
  public static FIAT_TOO_LONG: ErrorInfo = {
    key: 'FIAT_TOO_LONG',
    message: 'Fiat length too long',
    type: ErrorType.BAD_REQUEST,
  };
  public static TYPE_REQUIRED: ErrorInfo = {
    key: 'TYPE_REQUIRED',
    message: 'Type is required',
    type: ErrorType.BAD_REQUEST,
  };
  public static TYPE_INVALID: ErrorInfo = {
    key: 'TYPE_INVALID',
    message: 'Type is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static AMOUNT_TOO_LARGE: ErrorInfo = {
    key: 'AMOUNT_TOO_LARGE',
    message: 'Amount too large',
    type: ErrorType.BAD_REQUEST,
  };
  public static PAYMENT_METHOD_ID_INVALID: ErrorInfo = {
    key: 'PAYMENT_METHOD_ID_INVALID',
    message: 'Payment method id invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static NOTE_TOO_LONG: ErrorInfo = {
    key: 'NOTE_TOO_LONG',
    message: 'Note length too long',
    type: ErrorType.BAD_REQUEST,
  };
  public static NOTE_INVALID: ErrorInfo = {
    key: 'NOTE_INVALID',
    message: 'Note invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static AMOUNT_INVALID: ErrorInfo = {
    key: 'AMOUNT_INVALID',
    message: 'Amount invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static PERCENT_TOO_LARGE: ErrorInfo = {
    key: 'PERCENT_TOO_LARGE',
    message: 'Percent too large',
    type: ErrorType.BAD_REQUEST,
  };
  public static PERCENT_INVALID: ErrorInfo = {
    key: 'PERCENT_INVALID',
    message: 'Percent invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static STATUS_INVALID: ErrorInfo = {
    key: 'STATUS_INVALID',
    message: 'Status invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static TIME_INVALID: ErrorInfo = {
    key: 'TIME_INVALID',
    message: 'Time invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static LOWER_FIAT_LIMIT_REQUIRED: ErrorInfo = {
    key: 'LOWER_FIAT_LIMIT_REQUIRED',
    message: 'lowerFiatLimit is required.',
    type: ErrorType.BAD_REQUEST,
  };
  public static UPPER_FIAT_LIMIT_INVALID: ErrorInfo = {
    key: 'UPPER_FIAT_LIMIT_INVALID',
    message: 'upperFiatLimit is invalid.',
    type: ErrorType.BAD_REQUEST,
  };
  public static LOWER_FIAT_LIMIT_INVALID: ErrorInfo = {
    key: 'LOWER_FIAT_LIMIT_INVALID',
    message: 'lowerFiatLimit is invalid.',
    type: ErrorType.BAD_REQUEST,
  };
  public static UPPER_FIAT_LIMIT_REQUIRED: ErrorInfo = {
    key: 'UPPER_FIAT_LIMIT_REQUIRED',
    message: 'upperFiatLimit is required.',
    type: ErrorType.BAD_REQUEST,
  };
  public static UPPER_FIAT_MUST_GREATER_THAN_LOWER_FIAT: ErrorInfo = {
    key: 'UPPER_FIAT_MUST_GREATER_THAN_LOWER_FIAT',
    message: 'Upper fiat must be greater than lower fiat.',
    type: ErrorType.BAD_REQUEST,
  };
  public static SORT_DIRECTION_INVALID: ErrorInfo = {
    key: 'SORT_DIRECTION_INVALID',
    message: 'Sort direction is invalid',
    type: ErrorType.BAD_REQUEST,
  };
}
