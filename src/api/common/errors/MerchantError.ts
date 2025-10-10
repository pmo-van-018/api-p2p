import { ErrorInfo, ErrorType } from '@api/infrastructure/helpers/ErrorInfo';

export class MerchantError {
  public static MERCHANT_NOT_FOUND: ErrorInfo = {
    key: 'MERCHANT_NOT_FOUND',
    message: 'Merchant not found',
    type: ErrorType.NOT_FOUND,
  };
  public static MERCHANT_MANAGER_NOT_FOUND: ErrorInfo = {
    key: 'MERCHANT_MANAGER_NOT_FOUND',
    message: 'Merchant manager not found',
    type: ErrorType.NOT_FOUND,
  };
  public static STAFF_NOT_FOUND: ErrorInfo = {
    key: 'STAFF_NOT_FOUND',
    message: 'Staff not found',
    type: ErrorType.NOT_FOUND,
  };
  public static MERCHANT_WALLET_ADDRESS_ALREADY_CREATED: ErrorInfo = {
    key: 'MERCHANT_WALLET_ADDRESS_ALREADY_CREATED',
    message: 'Merchant wallet addres already created',
    type: ErrorType.BAD_REQUEST,
  };
  public static STAFF_CREATION_FAILED: ErrorInfo = {
    key: 'STAFF_CREATION_FAILED',
    message: 'STAFF creation failed',
    type: ErrorType.INTERNAL_SERVER,
  };
  public static MERCHANT_OPERATION_UPDATE_FAILED: ErrorInfo = {
    key: 'MERCHANT_OPERATION_UPDATED_FAILED',
    message: 'Merchant operator updated failed',
    type: ErrorType.INTERNAL_SERVER,
  };
  public static MERCHANT_SUPPORTER_UPDATE_FAILED: ErrorInfo = {
    key: 'MERCHANT_SUPPORTER_UPDATED_FAILED',
    message: 'Merchant supporter updated failed',
    type: ErrorType.INTERNAL_SERVER,
  };
  public static MERCHANT_IS_BLOCKED: ErrorInfo = {
    key: 'MERCHANT_IS_BLOCKED',
    message: 'Merchant is blocked',
    type: ErrorType.BAD_REQUEST,
  };
  public static STAFF_IS_EXCEED: ErrorInfo = {
    key: 'STAFF_IS_EXCEED',
    message: 'Staff is exceed',
    type: ErrorType.BAD_REQUEST,
  };
}
