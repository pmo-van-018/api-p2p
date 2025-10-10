import { ErrorInfo, ErrorType } from '@api/infrastructure/helpers/ErrorInfo';

export class OperationError {
  public static OPERATION_NOT_FOUND: ErrorInfo = {
    key: 'OPERATION_NOT_FOUND',
    message: 'Operation not found',
    type: ErrorType.NOT_FOUND,
  };
  public static ADMIN_SUPPORTER_NOT_FOUND: ErrorInfo = {
    key: 'ADMIN_SUPPORTER_NOT_FOUND',
    message: 'Admin supporter not found',
    type: ErrorType.NOT_FOUND,
  };
  public static SUPER_ADMIN_NOT_FOUND: ErrorInfo = {
    key: 'SUPER_ADMIN_NOT_FOUND',
    message: 'Super admin not found',
    type: ErrorType.NOT_FOUND,
  };
  public static OPERATION_IS_BLOCKED: ErrorInfo = {
    key: 'OPERATION_IS_BLOCKED',
    message: 'Operation is blocked',
    type: ErrorType.BAD_REQUEST,
  };
  public static OPERATION_IS_EXISTED: ErrorInfo = {
    key: 'OPERATION_IS_EXISTED',
    message: 'Operation is existed',
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
  public static OPERATION_UPDATE_STATUS_FAILED: ErrorInfo = {
    key: 'OPERATION_UPDATE_STATUS_FAILED',
    message: 'Operation update status failed',
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
  public static CAN_NOT_UPDATE_OPERATION: ErrorInfo = {
    key: 'CAN_NOT_UPDATE_OPERATION',
    message: 'Can not update user',
    type: ErrorType.BAD_REQUEST,
  };
  public static CAN_NOT_UPDATE_STATUS: ErrorInfo = {
    key: 'CAN_NOT_UPDATE_STATUS',
    message: 'Can not update status',
    type: ErrorType.BAD_REQUEST,
  };
  public static CANNOT_DISABLE_OPERATOR_HAS_PENDING_ORDER: ErrorInfo = {
    key: 'CANNOT_DISABLE_OPERATOR_HAS_PENDING_ORDER',
    message: 'Cannot disable operator because has pending order',
    type: ErrorType.BAD_REQUEST,
  };
  public static CANNOT_DISABLE_MANAGER_HAS_PENDING_ORDER: ErrorInfo = {
    key: 'CANNOT_DISABLE_MANAGER_HAS_PENDING_ORDER',
    message: 'Cannot disable manager because has pending order',
    type: ErrorType.BAD_REQUEST,
  };
  public static CANNOT_DISABLE_SUPPORTER_HAS_PENDING_ORDER: ErrorInfo = {
    key: 'CANNOT_DISABLE_SUPPORTER_HAS_PENDING_ORDER',
    message: 'Cannot disable manager because has pending order',
    type: ErrorType.BAD_REQUEST,
  };
  public static CANNOT_DISABLE_ADMIN_SUPPORTER_HAS_PENDING_APPEAL: ErrorInfo = {
    key: 'CANNOT_DISABLE_ADMIN_SUPPORTER_HAS_PENDING_APPEAL',
    message: 'Cannot disable admin supporter because has pending appeal',
    type: ErrorType.BAD_REQUEST,
  };
  public static MANAGER_HAS_PENDING_ORDER: ErrorInfo = {
    key: 'MANAGER_HAS_PENDING_ORDER',
    message: 'Manager has pending order',
    type: ErrorType.BAD_REQUEST,
  };
}
