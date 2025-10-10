import { ErrorInfo, ErrorType } from '@api/infrastructure/helpers/ErrorInfo';

export class CryptoTransactionError {
  public static NOT_FOUND: ErrorInfo = {
    key: 'NOT_FOUND',
    message: 'The crypto transaction not found',
    type: ErrorType.NOT_FOUND,
  };
  public static CRYPTO_TRANSACTION_ALREADY_EXISTS: ErrorInfo = {
    key: 'CRYPTO_TRANSACTION_ALREADY_EXISTS',
    message: 'Crypto transaction already exists',
    type: ErrorType.BAD_REQUEST,
  };
  public static CRYPTO_BLOCKCHAIN_PENDING_STATUS: ErrorInfo = {
    key: 'CRYPTO_BLOCKCHAIN_PENDING_STATUS',
    message: 'The crypto blockchain pending.',
    type: ErrorType.BAD_REQUEST,
  };
  public static SYSTEM_UPDATE_STATUS_FAILED: ErrorInfo = {
    key: 'SYSTEM_UPDATE_STATUS_FAILED',
    message: 'The system update crypto transaction status failed',
    type: ErrorType.BAD_REQUEST,
  };
  public static CRYPTO_MERCHANT_ADDRESS_IS_INCORRECT: ErrorInfo = {
    key: 'CRYPTO_MERCHANT_ADDRESS_IS_INCORRECT',
    message: 'Crypto merchant address is incorrect',
    type: ErrorType.BAD_REQUEST,
  };
  public static CRYPTO_USER_ADDRESS_IS_INCORRECT: ErrorInfo = {
    key: 'CRYPTO_USER_ADDRESS_IS_INCORRECT',
    message: 'Crypto user address is incorrect',
    type: ErrorType.BAD_REQUEST,
  };
  public static CRYPTO_AMOUNT_IS_INCORRECT: ErrorInfo = {
    key: 'CRYPTO_AMOUNT_IS_INCORRECT',
    message: 'Crypto amount is incorrect',
    type: ErrorType.BAD_REQUEST,
  };
  public static BLOCKCHAIN_TRANSACTION_NOT_FOUND: ErrorInfo = {
    key: 'BLOCKCHAIN_TRANSACTION_NOT_FOUND',
    message: 'Blockchain transaction not found.',
    type: ErrorType.BAD_REQUEST,
  };
  public static TX_HASH_ALREADY_EXISTS: ErrorInfo = {
    key: 'TX_HASH_ALREADY_EXISTS',
    message: 'Tx hash already exists',
    type: ErrorType.BAD_REQUEST,
  };
  public static ADDRESS_IS_INCORRECT: ErrorInfo = {
    key: 'ADDRESS_IS_INCORRECT',
    message: 'Address is incorrect',
    type: ErrorType.BAD_REQUEST,
  };
  public static TX_HASH_EXCEED_LIMIT: ErrorInfo = {
    key: 'TX_HASH_EXCEED_LIMIT',
    message: 'Tx hash exceed the limit',
    type: ErrorType.BAD_REQUEST,
  };
}
