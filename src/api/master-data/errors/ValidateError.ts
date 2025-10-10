import { ErrorInfo, ErrorType } from '@api/infrastructure/helpers/ErrorInfo';

export class ValidateError {
  public static PAYMENT_METHOD_LIMIT_IS_INVALID: ErrorInfo = {
    key: 'PAYMENT_METHOD_LIMIT_IS_INVALID',
    message: 'Payment method limit is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static ORDER_RECEIVING_LIMIT_IS_INVALID: ErrorInfo = {
    key: 'ORDER_RECEIVING_LIMIT_IS_INVALID',
    message: 'Order receiving limit is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static APPEAL_RECEIVING_LIMIT_IS_INVALID: ErrorInfo = {
    key: 'APPEAL_RECEIVING_LIMIT_IS_INVALID',
    message: 'Appeal receiving limit is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static SUPPORT_REQUESTS_RECEIVING_LIMIT_IS_INVALID: ErrorInfo = {
    key: 'SUPPORT_REQUESTS_RECEIVING_LIMIT_IS_INVALID',
    message: 'Support requests receiving limit is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static EVIDENCE_PROVISION_TIME_IS_INVALID: ErrorInfo = {
    key: 'EVIDENCE_PROVISION_TIME_IS_INVALID',
    message: 'Evidence provision time is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static CRYPTO_SENDING_WAIT_TIME_IS_INVALID: ErrorInfo = {
    key: 'CRYPTO_SENDING_WAIT_TIME_IS_INVALID',
    message: 'Crypto sending wait time is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static USER_ASK_CS_TIME_IS_INVALID: ErrorInfo = {
    key: 'USER_ASK_CS_TIME_IS_INVALID',
    message: 'User ask CS time is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static USER_ASK_MERCHANT_TIME_IS_INVALID: ErrorInfo = {
    key: 'USER_ASK_MERCHANT_TIME_IS_INVALID',
    message: 'User-ask-merchant time is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static LIMIT_INPUT_NOT_ALLOWED_BY_SYSTEM: ErrorInfo = {
    key: 'LIMIT_INPUT_NOT_ALLOWED_BY_SYSTEM',
    message: 'Limit input not allowed by system',
    type: ErrorType.BAD_REQUEST,
  };
  public static SUPPORTED_BANKS_INVALID: ErrorInfo = {
    key: 'SUPPORTED_BANKS_INVALID',
    message: 'Supported banks invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static MERCHANT_TO_USER_TIME_BUY_LIST_INVALID: ErrorInfo = {
    key: 'MERCHANT_TO_USER_TIME_BUY_LIST_INVALID',
    message: 'Merchant to user time buy list invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static MERCHANT_TO_USER_TIME_SELL_LIST_INVALID: ErrorInfo = {
    key: 'MERCHANT_TO_USER_TIME_SELL_LIST_INVALID',
    message: 'Merchant to user time sell list invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static MERCHANT_TO_USER_TIME_BUY_INVALID: ErrorInfo = {
    key: 'MERCHANT_TO_USER_TIME_BUY_INVALID',
    message: 'Merchant to user time buy invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static MERCHANT_TO_USER_TIME_SELL_INVALID: ErrorInfo = {
    key: 'MERCHANT_TO_USER_TIME_SELL_INVALID',
    message: 'Merchant to user time sell invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static USER_TO_MERCHANT_TIME_BUY_LIST_INVALID: ErrorInfo = {
    key: 'USER_TO_MERCHANT_TIME_BUY_LIST_INVALID',
    message: 'User to merchant time buy list invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static USER_TO_MERCHANT_TIME_SELL_LIST_INVALID: ErrorInfo = {
    key: 'USER_TO_MERCHANT_TIME_SELL_LIST_INVALID',
    message: 'User to merchant time sell list invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static SUPPORTED_ASSETS_INVALID: ErrorInfo = {
    key: 'SUPPORTED_ASSETS_INVALID',
    message: 'Supported assets invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static MIN_ORDER_LIMIT_INVALID: ErrorInfo = {
    key: 'MIN_ORDER_LIMIT_INVALID',
    message: 'Min order limit invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static MAX_ORDER_LIMIT_INVALID: ErrorInfo = {
    key: 'MAX_ORDER_LIMIT_INVALID',
    message: 'Max order limit invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static MAX_ORDER_LIMIT_IS_SMALLER_THAN_MIN_ORDER_LIMIT: ErrorInfo = {
    key: 'MAX_ORDER_LIMIT_IS_SMALLER_THAN_MIN_ORDER_LIMIT',
    message: 'Max order limit is smaller than min order limit',
    type: ErrorType.BAD_REQUEST,
  };
  public static MIN_POST_LIMIT_INVALID: ErrorInfo = {
    key: 'MIN_POST_LIMIT_INVALID',
    message: 'Min post limit invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static MAX_POST_LIMIT_INVALID: ErrorInfo = {
    key: 'MAX_POST_LIMIT_INVALID',
    message: 'Max post limit invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static MAX_POST_LIMIT_IS_SMALLER_THAN_MIN_POST_LIMIT: ErrorInfo = {
    key: 'MAX_POST_LIMIT_IS_SMALLER_THAN_MIN_POST_LIMIT',
    message: 'Max post limit is smaller than min post limit',
    type: ErrorType.BAD_REQUEST,
  };
  public static FEE_INVALID: ErrorInfo = {
    key: 'FEE_INVALID',
    message: 'Fee invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static PENALTY_FEE_INVALID: ErrorInfo = {
    key: 'PENALTY_FEE_INVALID',
    message: 'Penalty fee invalid',
    type: ErrorType.BAD_REQUEST,
  };
}
