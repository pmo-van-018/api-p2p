import { ErrorInfo, ErrorType } from '@api/infrastructure/helpers/ErrorInfo';

export class ShiftError {
  public static SHIFT_NOT_FOUND: ErrorInfo = {
    key: 'SHIFT_NOT_FOUND',
    message: 'Shift not found',
    type: ErrorType.BAD_REQUEST,
  };
  public static STATUS_IS_INVALID: ErrorInfo = {
    key: 'STATUS_IS_INVALID',
    message: 'Status is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static CREATE_SHIFT_FAIL: ErrorInfo = {
    key: 'CREATE_SHIFT_FAIL',
    message: 'Create shift fail',
    type: ErrorType.BAD_REQUEST,
  };
  public static CHECK_IN_FAILED: ErrorInfo = {
    key: 'CHECK_IN_FAILED',
    message: 'Check in failed',
    type: ErrorType.BAD_REQUEST,
  };
  public static CHECK_OUT_FAILED: ErrorInfo = {
    key: 'CHECK_OUT_FAILED',
    message: 'Check out failed',
    type: ErrorType.BAD_REQUEST,
  };
  public static SHIFT_IS_PROCESSING: ErrorInfo = {
    key: 'SHIFT_IS_PROCESSING',
    message: 'Shift is processing',
    type: ErrorType.BAD_REQUEST,
  };
  public static BALANCE_DOES_NOT_MATCH: ErrorInfo = {
    key: 'BALANCE_DOES_NOT_MATCH',
    message: 'Balance does not match',
    type: ErrorType.BAD_REQUEST,
  };
  public static NOT_CHECKED_IN_BEFORE: ErrorInfo = {
    key: 'NOT_CHECKED_IN_BEFORE',
    message: 'Not checked in before',
    type: ErrorType.BAD_REQUEST,
  };
  public static SHIFT_AMOUNT_DOES_NOT_MATCH: ErrorInfo = {
    key: 'SHIFT_AMOUNT_DOES_NOT_MATCH',
    message: 'Shift amount does not match',
    type: ErrorType.BAD_REQUEST,
  };
}
