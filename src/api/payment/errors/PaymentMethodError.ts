import { ErrorInfo, ErrorType } from '@api/infrastructure/helpers/ErrorInfo';

export class PaymentMethodError {
  public static PAYMENT_METHOD_NOT_FOUND: ErrorInfo = {
    key: 'PAYMENT_METHOD_NOT_FOUND',
    message: 'Payment method not found',
    type: ErrorType.BAD_REQUEST,
  };
  public static PAYMENT_METHOD_CREATION_IS_FAILED: ErrorInfo = {
    key: 'PAYMENT_METHOD_CREATION_IS_FAILED',
    message: 'Payment method creation failed',
    type: ErrorType.BAD_REQUEST,
  };
  public static PAYMENT_METHOD_HAS_REACH_LIMIT: ErrorInfo = {
    key: 'PAYMENT_METHOD_HAS_REACH_LIMIT',
    message: 'The number of payment method has reach the limit',
    type: ErrorType.BAD_REQUEST,
  };
  public static PAYMENT_METHOD_SEARCHING_FAILED: ErrorInfo = {
    key: 'PAYMENT_METHOD_SEARCHING_FAILED',
    message: 'Payment method searching failed',
    type: ErrorType.BAD_REQUEST,
  };
  public static PAYMENT_METHOD_DETAIL_IS_FAILED: ErrorInfo = {
    key: 'PAYMENT_METHOD_DETAIL_IS_FAILED',
    message: 'Payment method detail is failed',
    type: ErrorType.BAD_REQUEST,
  };
  public static PAYMENT_METHOD_DELETION_IS_FAILED: ErrorInfo = {
    key: 'PAYMENT_METHOD_DELETION_IS_FAILED',
    message: 'Payment method deleted is failed',
    type: ErrorType.BAD_REQUEST,
  };
  public static PAYMENT_METHOD_UPDATE_IS_FAILED_WHEN_EXISTING_ORDER: ErrorInfo = {
    key: 'PAYMENT_METHOD_UPDATE_IS_FAILED_WHEN_EXISTING_ORDER',
    message: `Payment method update is failed.<br />The current payment method has already used in Posts/ Orders.`,
    type: ErrorType.BAD_REQUEST,
  };
  public static PAYMENT_METHOD_DELETION_IS_FAILED_WHEN_EXISTING_ORDER: ErrorInfo = {
    key: 'PAYMENT_METHOD_DELETION_IS_FAILED_WHEN_EXISTING_ORDER',
    message: `Payment method deletion is failed.<br />The current payment method has already used in Posts/ Orders.`,
    type: ErrorType.BAD_REQUEST,
  };
  public static CAN_NOT_STORE_PAYMENT_METHOD_WHEN_EXISTING_ORDER: ErrorInfo = {
    key: 'CAN_NOT_STORE_PAYMENT_METHOD_WHEN_EXISTING_ORDER',
    message: `This action is failed.<br />The current payment method has already used in Posts/ Orders.`,
    type: ErrorType.BAD_REQUEST,
  };
  public static PAYMENT_METHOD_IS_NO_LONGER_SUPPORTED: ErrorInfo = {
    key: 'PAYMENT_METHOD_IS_NO_LONGER_SUPPORTED',
    message: 'Payment method is no longer supported',
    type: ErrorType.BAD_REQUEST,
  };
  public static PAYMENT_NUMBER_IS_EXIST: ErrorInfo = {
    key: 'PAYMENT_NUMBER_IS_EXIST',
    message: 'Payment method is exist',
    type: ErrorType.BAD_REQUEST,
  };
}
