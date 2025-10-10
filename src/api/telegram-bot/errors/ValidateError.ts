import { ErrorInfo, ErrorType } from '@api/infrastructure/helpers/ErrorInfo';

export class ValidateError {
  public static APPEAL_SECRET_KEY_LENGTH_INVALID: ErrorInfo = {
    key: 'APPEAL_SECRET_KEY_LENGTH_INVALID',
    message: 'appealSecretKey length is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static APPEAL_SECRET_KEY_FORMAT_INVALID: ErrorInfo = {
    key: 'APPEAL_SECRET_KEY_FORMAT_INVALID',
    message: 'appealSecretKey format is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static APPEAL_SECRET_KEY_REQUIRED: ErrorInfo = {
    key: 'APPEAL_SECRET_KEY_REQUIRED',
    message: 'appealSecretKey is required',
    type: ErrorType.BAD_REQUEST,
  };
  public static APPEAL_SECRET_KEY_INVALID: ErrorInfo = {
    key: 'APPEAL_SECRET_KEY_INVALID',
    message: 'appealSecretKey is invalid',
    type: ErrorType.BAD_REQUEST,
  };
}
