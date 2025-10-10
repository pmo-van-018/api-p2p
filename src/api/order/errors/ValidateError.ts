import { ErrorInfo, ErrorType } from '@api/infrastructure/helpers/ErrorInfo';

export class ValidateError {
  public static PAYMENT_METHOD_ID_IS_REQUIRED: ErrorInfo = {
    key: 'PAYMENT_METHOD_ID_IS_REQUIRED',
    message: 'Payment method id is required',
    type: ErrorType.BAD_REQUEST,
  };
  public static PAYMENT_METHOD_ID_IS_INVALID: ErrorInfo = {
    key: 'PAYMENT_METHOD_ID_IS_INVALID',
    message: 'Payment method id is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static AMOUNT_IS_REQUIRED: ErrorInfo = {
    key: 'AMOUNT_IS_REQUIRED',
    message: 'Amount is required',
    type: ErrorType.BAD_REQUEST,
  };
  public static AMOUNT_IS_INVALID: ErrorInfo = {
    key: 'AMOUNT_IS_INVALID',
    message: 'Amount is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static POST_ID_IS_REQUIRED: ErrorInfo = {
    key: 'POST_ID_IS_REQUIRED',
    message: 'Post id is required',
    type: ErrorType.BAD_REQUEST,
  };
  public static POST_ID_IS_INVALID: ErrorInfo = {
    key: 'POST_ID_IS_INVALID',
    message: 'Post id is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static PRICE_IS_REQUIRED: ErrorInfo = {
    key: 'PRICE_IS_REQUIRED',
    message: 'Price is required',
    type: ErrorType.BAD_REQUEST,
  };
  public static PRICE_IS_INVALID: ErrorInfo = {
    key: 'PRICE_IS_INVALID',
    message: 'Price is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static ORDER_ID_IS_INVALID: ErrorInfo = {
    key: 'ORDER_ID_IS_INVALID',
    message: 'Order id is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static HASH_IS_INVALID: ErrorInfo = {
    key: 'HASH_IS_INVALID',
    message: 'Hash is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static TYPE_IS_INVALID: ErrorInfo = {
    key: 'TYPE_IS_INVALID',
    message: 'Type is invalid',
    type: ErrorType.BAD_REQUEST,
  };
}
