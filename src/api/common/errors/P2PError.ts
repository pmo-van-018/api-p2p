import { ErrorInfo, ErrorType } from '@api/infrastructure/helpers/ErrorInfo';

export class P2PError extends Error {
  public key: string;

  public message: string;

  public property: string;

  public type: ErrorType;

  constructor(errorInfo: ErrorInfo) {
    super(errorInfo.message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.key = errorInfo.key;
    this.message = errorInfo.message;
    this.property = errorInfo.property;
    this.type = errorInfo.type;

    Error.captureStackTrace(this);
  }
}
