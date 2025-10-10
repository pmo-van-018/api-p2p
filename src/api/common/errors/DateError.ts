import { ErrorInfo, ErrorType } from '@api/infrastructure/helpers/ErrorInfo';
export class DateError {
  public static DATE_MUST_IN_THE_PAST: ErrorInfo = {
    key: 'DATE_MUST_IN_THE_PAST',
    message: 'Date must in the past',
    type: ErrorType.BAD_REQUEST,
  };
}
