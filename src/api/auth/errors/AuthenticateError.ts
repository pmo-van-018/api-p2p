import { ErrorInfo, ErrorType } from '@api/infrastructure/helpers/ErrorInfo';

export class AuthenticateError {
  public static UNAUTHENTICATED: ErrorInfo = {
    key: 'UNAUTHENTICATED',
    message: 'The wallet is not connected',
    type: ErrorType.AUTHENTICATION,
  };
  public static FORBIDDEN: ErrorInfo = {
    key: 'FORBIDDEN',
    message: 'Forbidden to access this resource',
    type: ErrorType.AUTHENTICATION,
  };
  public static UNAUTHORIZED: ErrorInfo = {
    key: 'UNAUTHORIZED',
    message: 'Unauthorized to access this resource',
    type: ErrorType.AUTHENTICATION,
  };
  public static INVALID_CREDENTIALS: ErrorInfo = {
    key: 'INVALID_CREDENTIALS',
    message: 'Invalid credentials',
    type: ErrorType.AUTHENTICATION,
  };
}
