import { ErrorInfo, ErrorType } from '@api/infrastructure/helpers/ErrorInfo';
export class FeatureResponseError {
  public static FEATURE_NOT_SUPPORTED: ErrorInfo = {
    key: 'FEATURE_NOT_SUPPORTED',
    message: 'Feature not supported',
    type: ErrorType.NOT_FOUND,
  };
}
