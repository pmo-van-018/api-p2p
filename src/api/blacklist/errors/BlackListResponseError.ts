import { ErrorInfo, ErrorType } from '@api/infrastructure/helpers/ErrorInfo';

export class BlackListResponseError {
  public static WALLET_ADDRESS_IS_EXISTED_IN_BLACKLIST: ErrorInfo = {
    key: 'WALLET_ADDRESS_IS_EXISTED_IN_BLACKLIST',
    message: 'Wallet address is exist',
    type: ErrorType.BAD_REQUEST,
  };
  public static ADD_WALLET_ADDRESS_TO_BLACKLIST_FAILED: ErrorInfo = {
    key: 'ADD_WALLET_ADDRESS_TO_BLACKLIST_FAILED',
    message: 'Add wallet address fail',
    type: ErrorType.INTERNAL_SERVER,
  };
  public static WALLET_ADDRESS_IS_NOT_EXISTED_IN_BLACKLIST: ErrorInfo = {
    key: 'WALLET_ADDRESS_IS_NOT_EXISTED_IN_BLACKLIST',
    message: 'Wallet address is not exist',
    type: ErrorType.BAD_REQUEST,
  };
  public static THE_WALLET_ADDRESS_IS_IN_THE_BLACKLIST: ErrorInfo = {
    key: 'THE_WALLET_ADDRESS_IS_IN_THE_BLACKLIST',
    message: 'The wallet address is in the blacklist',
    type: ErrorType.BAD_REQUEST,
  };
  public static WALLET_ADDRESS_IS_EXISTING_IN_OTHER_ROLES: ErrorInfo = {
    key: 'WALLET_ADDRESS_IS_EXISTING_IN_OTHER_ROLES',
    message: 'Wallet address is existing in other roles',
    type: ErrorType.BAD_REQUEST,
  };
}
