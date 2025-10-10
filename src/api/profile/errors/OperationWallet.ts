import { ErrorInfo, ErrorType } from '@api/infrastructure/helpers/ErrorInfo';

export class OperationWalletError {
  public static WALLET_ADDRESS_IS_EXISTED: ErrorInfo = {
    key: 'WALLET_ADDRESS_IS_EXISTED',
    message: 'Wallet address is existed',
    type: ErrorType.BAD_REQUEST,
  };
  public static ADD_WALLET_ADDRESS_FAIL: ErrorInfo = {
    key: 'ADD_WALLET_ADDRESS_FAIL',
    message: 'Add wallet address fail',
    type: ErrorType.BAD_REQUEST,
  };
  public static WALLET_ADDRESS_NOT_FOUND: ErrorInfo = {
    key: 'WALLET_ADDRESS_NOT_FOUND',
    message: 'Wallet address not found',
    type: ErrorType.NOT_FOUND,
  };
  public static MANAGER_HAS_PENDING_ORDER: ErrorInfo = {
    key: 'MANAGER_HAS_PENDING_ORDER',
    message: 'Manager has pending order',
    type: ErrorType.BAD_REQUEST,
  };
  public static WALLET_ADDRESS_HAS_ACTIVED: ErrorInfo = {
    key: 'WALLET_ADDRESS_HAS_ACTIVED',
    message: 'Wallet address has actived',
    type: ErrorType.BAD_REQUEST,
  };
  public static THE_WALLET_ADDRESS_IS_IN_THE_BLACKLIST: ErrorInfo = {
    key: 'THE_WALLET_ADDRESS_IS_IN_THE_BLACKLIST',
    message: 'The wallet address is in the blacklist',
    type: ErrorType.BAD_REQUEST,
  };
  public static ACTIVE_WALLET_ADDRESS_FAIL: ErrorInfo = {
    key: 'ACTIVE_WALLET_ADDRESS_FAIL',
    message: 'Active wallet address fail',
    type: ErrorType.BAD_REQUEST,
  };
  public static WALLET_ADDRESS_CANNOT_EMPTY: ErrorInfo = {
    key: 'WALLET_ADDRESS_CANNOT_EMPTY',
    message: 'Wallet address cannot empty',
    type: ErrorType.BAD_REQUEST,
  };
  public static DELETE_WALLET_ADDRESS_FAIL: ErrorInfo = {
    key: 'DELETE_WALLET_ADDRESS_FAIL',
    message: 'Delete wallet address fail',
    type: ErrorType.BAD_REQUEST,
  };
  public static MANAGER_NOT_FOUND: ErrorInfo = {
    key: 'MANAGER_NOT_FOUND',
    message: 'Manager not found',
    type: ErrorType.NOT_FOUND,
  };
}
