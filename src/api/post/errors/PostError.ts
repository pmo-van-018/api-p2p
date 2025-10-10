import { ErrorInfo, ErrorType } from '@api/infrastructure/helpers/ErrorInfo';

export class PostError {
  public static MERCHANT_BUY_POST_IS_UNAVAILABLE: ErrorInfo = {
    key: 'MERCHANT_BUY_POST_IS_UNAVAILABLE',
    message: 'Merchant buy post is unavailable',
    type: ErrorType.NOT_FOUND,
  };
  public static BUY_TYPE_INVALID: ErrorInfo = {
    key: 'BUY_TYPE_INVALID',
    message: 'Post buy type is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static ONLINE_INVALID: ErrorInfo = {
    key: 'ONLINE_INVALID',
    message: 'Post is not online',
    type: ErrorType.BAD_REQUEST,
  };
  public static SEARCH_ONLINE_POST_FAIL: ErrorInfo = {
    key: 'SEARCH_ONLINE_POST_FAIL',
    message: 'Search online post failed',
    type: ErrorType.BAD_REQUEST,
  };
  public static GET_POST_DETAIL_FAIL: ErrorInfo = {
    key: 'GET_POST_DETAIL_FAIL',
    message: 'Get post detail failed',
    type: ErrorType.BAD_REQUEST,
  };
  public static POSTING_CREATION_IS_FAILED: ErrorInfo = {
    key: 'POSTING_CREATION_IS_FAILED',
    message: 'posting creation is failed',
    type: ErrorType.BAD_REQUEST,
  };
  public static POSTING_UPDATE_IS_FAILED: ErrorInfo = {
    key: 'POSTING_UPDATE_IS_FAILED',
    message: 'posting update is failed',
    type: ErrorType.BAD_REQUEST,
  };
  public static POST_ID_IS_INVALID: ErrorInfo = {
    key: 'POST_ID_IS_INVALID',
    message: 'posting is failed',
    type: ErrorType.BAD_REQUEST,
  };
  public static MERCHANT_SELL_POST_IS_UNAVAILABLE: ErrorInfo = {
    key: 'MERCHANT_SELL_POST_IS_UNAVAILABLE',
    message: 'Merchant sell post is unavailable',
    type: ErrorType.NOT_FOUND,
  };
  public static POST_NOT_FOUND: ErrorInfo = {
    key: 'POST_NOT_FOUND',
    message: 'Post not found',
    type: ErrorType.NOT_FOUND,
  };
  public static POSTING_STATUS_IS_INVALID: ErrorInfo = {
    key: 'POSTING_STATUS_IS_INVALID',
    message: 'posting status is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static CANNOT_UPDATE_CLOSED_POST: ErrorInfo = {
    key: 'CANNOT_UPDATE_CLOSED_POST',
    message: 'Cannot update closed post',
    type: ErrorType.BAD_REQUEST,
  };
  public static NO_PERMISSION_TO_UPDATE_POST: ErrorInfo = {
    key: 'NO_PERMISSION_TO_UPDATE_POST',
    message: 'No permission to update post',
    type: ErrorType.BAD_REQUEST,
  };
  public static PAYMENT_METHOD_IS_INVALID: ErrorInfo = {
    key: 'PAYMENT_METHOD_IS_INVALID',
    message: 'Payment method is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static PAYMENT_METHOD_ID_IS_INVALID: ErrorInfo = {
    key: 'PAYMENT_METHOD_ID_IS_INVALID',
    message: 'Payment method Id is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static PAYMENT_METHOD_IS_NO_LONGER_SUPPORTED: ErrorInfo = {
    key: 'PAYMENT_METHOD_IS_NO_LONGER_SUPPORTED',
    message: 'Payment method is no longer supported',
    type: ErrorType.BAD_REQUEST,
  };
  public static CRYPTO_AMOUNT_IS_SMALLER_THAN_UPPER_ORDER_LIMIT: ErrorInfo = {
    key: 'CRYPTO_AMOUNT_IS_SMALLER_THAN_UPPER_ORDER_LIMIT',
    message: 'Crypto amount is smaller than upper order limit',
    type: ErrorType.BAD_REQUEST,
  };
  public static UPPER_FIAT_LIMIT_IS_SMALLER_THAN_LOWER_ORDER_LIMIT: ErrorInfo = {
    key: 'UPPER_FIAT_LIMIT_IS_SMALLER_THAN_LOWER_ORDER_LIMIT',
    message: 'Upper fiat limit is smaller than lower order limit',
    type: ErrorType.BAD_REQUEST,
  };
  public static SAME_ONLINE_POSTING_AD_ALREADY_EXIST: ErrorInfo = {
    key: 'SAME_ONLINE_POSTING_AD_ALREADY_EXIST',
    message: 'Same online posting ad already exist',
    type: ErrorType.BAD_REQUEST,
  };
  public static CRYPTO_AMOUNT_IS_SMALLER_THAN_LOWER_ORDER_LIMIT: ErrorInfo = {
    key: 'CRYPTO_AMOUNT_IS_SMALLER_THAN_LOWER_ORDER_LIMIT',
    message: 'Crypto amount is smaller than lower order limit',
    type: ErrorType.BAD_REQUEST,
  };
  public static USER_TO_MERCHANT_TIME_IS_INVALID: ErrorInfo = {
    key: 'USER_TO_MERCHANT_TIME_IS_INVALID',
    message: 'User-to-merchant time is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static CANNOT_UPDATE_PAYMENT_METHOD_WAS_DEACTIVATED: ErrorInfo = {
    key: 'CANNOT_UPDATE_PAYMENT_METHOD_WAS_DEACTIVATED',
    message: 'The current payment method no longer supports this post. Please update other payment methods.',
    type: ErrorType.BAD_REQUEST,
  };
  public static NOTE_IS_INVALID: ErrorInfo = {
    key: 'NOTE_IS_INVALID',
    message: 'Note is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static WRONG_NETWORK_IN_CREATING_POST: ErrorInfo = {
    key: 'WRONG_NETWORK_IN_CREATING_POST',
    message: 'Wrong network in creating post',
    type: ErrorType.BAD_REQUEST,
  };
  public static LOWER_FIAT_LIMIT_IS_SMALLER_THAN_LOWEST_SYSTEM_LIMIT: ErrorInfo = {
    key: 'LOWER_FIAT_LIMIT_IS_SMALLER_THAN_LOWEST_SYSTEM_LIMIT',
    message: 'Lower fiat limit is smaller than lowest system limit',
    type: ErrorType.BAD_REQUEST,
  };
  public static UPPER_FIAT_LIMIT_IS_HIGHER_THAN_HIGHEST_SYSTEM_LIMIT: ErrorInfo = {
    key: 'UPPER_FIAT_LIMIT_IS_HIGHER_THAN_HIGHEST_SYSTEM_LIMIT',
    message: 'Upper fiat limit is higher than highest system limit',
    type: ErrorType.BAD_REQUEST,
  };
  public static CRYPTO_AMOUNT_EXCEEDS_THE_SYSTEM_LIMIT: ErrorInfo = {
    key: 'CRYPTO_AMOUNT_EXCEEDS_THE_SYSTEM_LIMIT',
    message: 'Crypto amount exceeds the system limit',
    type: ErrorType.BAD_REQUEST,
  };
  public static ASSET_IS_INVALID: ErrorInfo = {
    key: 'ASSET_IS_INVALID',
    message: 'Asset is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static TOKEN_IS_NO_LONGER_SUPPORTED: ErrorInfo = {
    key: 'TOKEN_IS_NO_LONGER_SUPPORTED',
    message: 'Token is no longer supported',
    type: ErrorType.BAD_REQUEST,
  };
  public static CRYPTO_TYPE_IS_INVALID: ErrorInfo = {
    key: 'CRYPTO_TYPE_IS_INVALID',
    message: 'Crypto type not invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static FIAT_TYPE_IS_INVALID: ErrorInfo = {
    key: 'FIAT_TYPE_IS_INVALID',
    message: 'Fiat type invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static MASTER_DATA_LEVEL_NOT_FOUND: ErrorInfo = {
    key: 'MASTER_DATA_LEVEL_NOT_FOUND',
    message: 'Master data level not found',
    type: ErrorType.NOT_FOUND,
  };
}
