export interface ErrorInfo {
  key: string;
  message?: string;
  property?: string;
  type: ErrorType;
}

export enum ErrorType {
  NOT_FOUND = 1,
  BAD_REQUEST = 2,
  INTERNAL_SERVER = 3,
  AUTHENTICATION = 4,
  FORBIDDEN = 5,
  TOO_MANY_REQUEST = 6,
}
