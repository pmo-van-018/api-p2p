import { ErrorInfo, ErrorType } from '@api/infrastructure/helpers/ErrorInfo';

export class HttpResponseError {
  public static INTERNAL_ERROR: ErrorInfo = {
    key: 'INTERNAL_ERROR',
    message: 'Internal Error',
    type: ErrorType.INTERNAL_SERVER,
  };
  public static FORBIDDEN_ERROR: ErrorInfo = {
    key: 'FORBIDDEN_ERROR',
    message: 'Forbidden Error',
    type: ErrorType.FORBIDDEN,
  };
  public static INPUT_VALIDATE_ERROR: ErrorInfo = {
    key: 'INPUT_VALIDATE_ERROR',
    message: 'Input validate Error',
    type: ErrorType.BAD_REQUEST,
  };
  public static DECRYPT_ERROR: ErrorInfo = {
    key: 'DECRYPT_ERROR',
    message: 'Decrypt Error',
    type: ErrorType.BAD_REQUEST,
  };
  public static UNENCRYPTED: ErrorInfo = {
    key: 'UNENCRYPTED',
    message: 'Unencrypted',
    type: ErrorType.BAD_REQUEST,
  };
  public static VALIDATE_2FA_FAILED: ErrorInfo = {
    key: 'VALIDATE_2FA_FAILED',
    message: 'Validate 2fa failed',
    type: ErrorType.FORBIDDEN,
  };
  public static REQUIRE_ACTIVATE_2FA: ErrorInfo = { // incase the session does not contain 2fa
    key: 'REQUIRE_ACTIVATE_2FA',
    message: 'Require activate 2fa',
    type: ErrorType.FORBIDDEN,
  };
  public static REQUIRE_CODE_2FA: ErrorInfo = { // incase the session does not contain 2fa
    key: 'REQUIRE_CODE_2FA',
    message: 'Require code 2fa',
    type: ErrorType.FORBIDDEN,
  };
  public static ALREADY_VERIFIED_2FA: ErrorInfo = {
    key: 'ALREADY_VERIFIED_2FA',
    message: 'Already verified 2FA',
    type: ErrorType.BAD_REQUEST,
  };
  public static TOO_MANY_REQUEST: ErrorInfo = { // incase the session does not contain 2fa
    key: 'TOO_MANY_REQUEST',
    message: 'Too many request',
    type: ErrorType.TOO_MANY_REQUEST,
  };
}
