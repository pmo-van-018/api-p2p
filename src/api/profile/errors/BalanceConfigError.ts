import { ErrorInfo, ErrorType } from '@api/infrastructure/helpers/ErrorInfo';

export class BalanceConfigError {
  public static ASSET_IS_REQUIRED: ErrorInfo = {
    key: 'ASSET_IS_REQUIRED',
    message: 'Asset is required.',
    type: ErrorType.BAD_REQUEST,
  };
  public static BALANCE_LIMIT_IS_REQUIRED: ErrorInfo = {
    key: 'BALANCE_LIMIT_IS_REQUIRED',
    message: 'Balance limit is required.',
    type: ErrorType.BAD_REQUEST,
  };
  public static ASSET_IS_INVALID: ErrorInfo = {
    key: 'ASSET_IS_INVALID',
    message: 'Asset is invalid.',
    type: ErrorType.BAD_REQUEST,
  };
  public static BALANCE_LIMIT_IS_INVALID: ErrorInfo = {
    key: 'BALANCE_LIMIT_IS_INVALID',
    message: 'Balance limit is invalid.',
    type: ErrorType.BAD_REQUEST,
  };
  public static BALANCE_CONFIGS_REQUIRED: ErrorInfo = {
    key: 'BALANCE_CONFIGS_REQUIRED',
    message: 'Balance configurations are required.',
    type: ErrorType.BAD_REQUEST,
  };
  public static BALANCE_CONFIGS_INVALID: ErrorInfo = {
    key: 'BALANCE_CONFIGS_INVALID',
    message: 'Balance configurations invalid.',
    type: ErrorType.BAD_REQUEST,
  };
  public static CREATE_BALANCE_CONFIG_FAIL: ErrorInfo = {
    key: 'CREATE_BALANCE_CONFIG_FAIL',
    message: 'Create balance configuration fail.',
    type: ErrorType.BAD_REQUEST,
  };
}
