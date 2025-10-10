import { ErrorInfo, ErrorType } from '@api/infrastructure/helpers/ErrorInfo';

export class UserError {
  public static USER_NOT_FOUND: ErrorInfo = {
    key: 'USER_NOT_FOUND',
    message: 'User not found',
    type: ErrorType.NOT_FOUND,
  };
  public static USERNAME_OR_PASSWOR_IS_INCORRECT: ErrorInfo = {
    key: 'USERNAME_OR_PASSWOR_IS_INCORRECT',
    message: 'Username or passwords is incorrect',
    type: ErrorType.BAD_REQUEST,
  };
  public static CONFIRM_NEW_PASSWOR_IS_INCORRECT: ErrorInfo = {
    key: 'CONFIRM_NEW_PASSWOR_IS_INCORRECT',
    message: 'Confirm new password is incorrect',
    type: ErrorType.BAD_REQUEST,
  };
  public static USER_IS_BLOCKED: ErrorInfo = {
    key: 'USER_IS_BLOCKED',
    message: 'USER is blocked',
    type: ErrorType.BAD_REQUEST,
  };
  public static OPERATION_IS_BLOCKED: ErrorInfo = {
    key: 'OPERATION_IS_BLOCKED',
    message: 'Operation is blocked',
    type: ErrorType.BAD_REQUEST,
  };
  public static USER_IS_EXISTED: ErrorInfo = {
    key: 'USER_IS_EXISTED',
    message: 'User is existed',
    type: ErrorType.BAD_REQUEST,
  };
  public static MERCHANT_NOT_FOUND: ErrorInfo = {
    key: 'MERCHANT_NOT_FOUND',
    message: 'Merchant not found',
    type: ErrorType.NOT_FOUND,
  };
  public static MERCHANT_IS_BLOCKED: ErrorInfo = {
    key: 'MERCHANT_IS_BLOCKED',
    message: 'Merchant is blocked',
    type: ErrorType.BAD_REQUEST,
  };
  public static MERCHANT_IS_EXISTED: ErrorInfo = {
    key: 'MERCHANT_IS_EXISTED',
    message: 'Merchant is existed',
    type: ErrorType.BAD_REQUEST,
  };
  public static ADMIN_NOT_FOUND: ErrorInfo = {
    key: 'ADMIN_NOT_FOUND',
    message: 'Admin not found',
    type: ErrorType.NOT_FOUND,
  };
  public static MERCHANT_MANAGER_WALLET_ADDRESS_ALREADY_CREATED: ErrorInfo = {
    key: 'MERCHANT_MANAGER_WALLET_ADDRESS_ALREADY_CREATED',
    message: 'Merchant manager wallet address already created',
    type: ErrorType.BAD_REQUEST,
  };
  public static MERCHANT_MANAGER_STATUS_IS_INVALID: ErrorInfo = {
    key: 'MERCHANT_MANAGER_STATUS_IS_INVALID',
    message: 'Merchant manager status is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static STAFF_WALLET_ADDRESS_ALREADY_CREATED: ErrorInfo = {
    key: 'STAFF_WALLET_ADDRESS_ALREADY_CREATED',
    message: 'Staff wallet address already created',
    type: ErrorType.BAD_REQUEST,
  };
  public static NO_PERMISSION_TO_ACCESS_RESOURCE: ErrorInfo = {
    key: 'NO_PERMISSION_TO_ACCESS_RESOURCE',
    message: 'No permission to access resource',
    type: ErrorType.FORBIDDEN,
  };
  public static NICKNAME_IS_EXISTED: ErrorInfo = {
    key: 'NICKNAME_IS_EXISTED',
    message: 'Nickname is existed',
    type: ErrorType.BAD_REQUEST,
  };
  public static NICKNAME_INVALID: ErrorInfo = {
    key: 'NICKNAME_INVALID',
    message: 'Nickname invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static USER_UPDATE_STATUS_FAILED: ErrorInfo = {
    key: 'USER_UPDATE_STATUS_FAILED',
    message: 'User update status failed',
    type: ErrorType.INTERNAL_SERVER,
  };
  public static SUPPORT_BLOCK_STAFF: ErrorInfo = {
    key: 'SUPPORT_BLOCK_STAFF',
    message: 'Currently, we ony support block staff!',
    type: ErrorType.BAD_REQUEST,
  };
  public static DATE_CONTRACT_IS_INVALID: ErrorInfo = {
    key: 'DATE_CONTRACT_IS_INVALID',
    message: 'Date contract is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static CAN_NOT_UPDATE_USER: ErrorInfo = {
    key: 'CAN_NOT_UPDATE_USER',
    message: 'Can not update user',
    type: ErrorType.BAD_REQUEST,
  };
  public static CAN_NOT_UPDATE_STATUS: ErrorInfo = {
    key: 'CAN_NOT_UPDATE_STATUS',
    message: 'Can not update status',
    type: ErrorType.BAD_REQUEST,
  };
  public static WALLET_ADDRESS_INVALID: ErrorInfo = {
    key: 'WALLET_ADDRESS_INVALID',
    message: 'Wallet address invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static AVATAR_IS_USED: ErrorInfo = {
    key: 'AVATAR_IS_USED',
    message: 'Avatar is used',
    type: ErrorType.BAD_REQUEST,
  };
}
