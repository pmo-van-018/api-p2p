import { ErrorInfo, ErrorType } from '@api/infrastructure/helpers/ErrorInfo';

export class AdminError {
  public static MERCHANT_MANAGER_CREATION_FAILED: ErrorInfo = {
    key: 'MERCHANT_MANAGER_CREATION_FAILED',
    message: 'Merchant manager creation failed',
    type: ErrorType.INTERNAL_SERVER,
  };
  public static MERCHANT_MANAGER_WALLET_ADDRESS_ALREADY_CREATED: ErrorInfo = {
    key: 'MERCHANT_MANAGER_WALLET_ADDRESS_ALREADY_CREATED',
    message: 'Merchant manager wallet addres already created',
    type: ErrorType.BAD_REQUEST,
  };
  public static MERCHANT_MANAGER_STATUS_IS_INVALID: ErrorInfo = {
    key: 'MERCHANT_MANAGER_STATUS_IS_INVALID',
    message: 'Merchant manager status is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static MERCHANT_MANAGER_LEVEL_IS_INVALID: ErrorInfo = {
    key: 'MERCHANT_MANAGER_LEVEL_IS_INVALID',
    message: 'Merchant manager level is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static ADMIN_SUPPORTER_CREATION_FAILED: ErrorInfo = {
    key: 'ADMIN_SUPPORTER_CREATION_FAILED',
    message: 'Admin supporter creation failed',
    type: ErrorType.INTERNAL_SERVER,
  };
  public static ADMIN_SUPPORTER_UPDATE_FAILED: ErrorInfo = {
    key: 'ADMIN_SUPPORTER_UPDATE_FAILED',
    message: 'Admin supporter updated failed',
    type: ErrorType.INTERNAL_SERVER,
  };
  public static GASLESS_TRANS_LIMIT_IS_REQUIRED: ErrorInfo = {
    key: 'GASLESS_TRANS_LIMIT_IS_REQUIRED',
    message: 'Gasless trans limit is required',
    type: ErrorType.INTERNAL_SERVER,
  };
  public static GASLESS_TRANS_LIMIT_IS_INVALID: ErrorInfo = {
    key: 'GASLESS_TRANS_LIMIT_IS_INVALID',
    message: 'Gasless trans limit is invalid',
    type: ErrorType.INTERNAL_SERVER,
  };
  public static ALLOW_GASLESS_IS_REQUIRED: ErrorInfo = {
    key: 'ALLOW_GASLESS_IS_REQUIRED',
    message: 'Allow gasless is required',
    type: ErrorType.INTERNAL_SERVER,
  };
  public static ALLOW_GASLESS_IS_INVALID: ErrorInfo = {
    key: 'ALLOW_GASLESS_IS_INVALID',
    message: 'Allow gasless is invalid',
    type: ErrorType.INTERNAL_SERVER,
  };
}
