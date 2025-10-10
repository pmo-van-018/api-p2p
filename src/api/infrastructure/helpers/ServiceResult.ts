import { ErrorInfo } from './ErrorInfo';

export class ServiceResult<T> {
  public static success<T>(data?: T): ServiceResult<T> {
    return new ServiceResult<T>(data, null);
  }

  public static fail<T>(error: ErrorInfo): ServiceResult<T> {
    return new ServiceResult<T>(null, [error]);
  }

  public data?: T;
  public errors?: ErrorInfo[];

  constructor(data?: T, errors?: ErrorInfo[]) {
    this.data = data;
    this.errors = errors;
  }
}
