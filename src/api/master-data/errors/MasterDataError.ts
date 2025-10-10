import { ErrorInfo, ErrorType } from '@api/infrastructure/helpers/ErrorInfo';

export class MasterDataError {
  public static MASTER_DATA_LEVEL_NOT_FOUND: ErrorInfo = {
    key: 'MASTER_DATA_LEVEL_NOT_FOUND',
    message: 'Master data level not found',
    type: ErrorType.NOT_FOUND,
  };
  public static NETWORK_IS_INVALID: ErrorInfo = {
    key: 'NETWORK_IS_INVALID',
    message: 'Network is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static WALLET_IS_INVALID: ErrorInfo = {
    key: 'WALLET_IS_INVALID',
    message: 'Wallet is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static ASSET_IS_BEING_MAINTAINED: ErrorInfo = {
    key: 'ASSET_IS_BEING_MAINTAINED',
    message: 'Asset is being maintained',
    type: ErrorType.BAD_REQUEST,
  };
}
