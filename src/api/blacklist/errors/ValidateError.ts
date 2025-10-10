import { ErrorInfo, ErrorType } from '@api/infrastructure/helpers/ErrorInfo';

export class ValidateError {
  public static SEARCH_VALUE_INVALID: ErrorInfo = {
    key: 'SEARCH_VALUE_INVALID',
    message: 'Search value invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static TYPE_INVALID: ErrorInfo = {
    key: 'TYPE_INVALID',
    message: 'type invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static WALLET_ADDRESS_REQUIRED: ErrorInfo = {
    key: 'WALLET_ADDRESS_REQUIRED',
    message: 'Wallet address required',
    type: ErrorType.BAD_REQUEST,
  };
  public static WALLET_ADDRESS_INVALID: ErrorInfo = {
    key: 'WALLET_ADDRESS_INVALID',
    message: 'Wallet address invalid',
    type: ErrorType.BAD_REQUEST,
  };
}
