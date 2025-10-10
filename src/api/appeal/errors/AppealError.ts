import { ErrorInfo, ErrorType } from '@api/infrastructure/helpers/ErrorInfo';

export class AppealError {
  public static APPEAL_NOT_FOUND: ErrorInfo = {
    key: 'APPEAL_NOT_FOUND',
    message: 'Appeal not found',
    type: ErrorType.NOT_FOUND,
  };
  public static PERMISSION_DENIED: ErrorInfo = {
    key: 'APPEAL_PERMISSION_DENIED',
    message: 'permission denied',
    type: ErrorType.FORBIDDEN,
  };
  public static ADD_TIME_FOR_APPEAL_PERMISSION_DENIED: ErrorInfo = {
    key: 'ADD_TIME_FOR_APPEAL_PERMISSION_DENIED',
    message: 'Add more time for appeal permission denied',
    type: ErrorType.BAD_REQUEST,
  };
  public static TIME_EXTRA_IS_IN_THE_PAST: ErrorInfo = {
    key: 'TIME_EXTRA_IS_IN_THE_PAST',
    message: 'The extra time is in the past',
    type: ErrorType.BAD_REQUEST,
  };
  public static APPEAL_ADD_MORE_TIME_FAILED: ErrorInfo = {
    key: 'APPEAL_ADD_MORE_TIME_FAILED',
    message: 'The extra time is in the past',
    type: ErrorType.BAD_REQUEST,
  };
  public static MAKE_DECISION_PERMISSION_DENIED: ErrorInfo = {
    key: 'MAKE_DECISION_PERMISSION_DENIED',
    message: 'Making decision permission denied',
    type: ErrorType.BAD_REQUEST,
  };
  public static APPEAL_STATUS_IS_INVALID: ErrorInfo = {
    key: 'APPEAL_STATUS_IS_INVALID',
    message: 'Appeal status is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static DECISION_RESULT_IS_INVALID: ErrorInfo = {
    key: 'DECISION_RESULT_IS_INVALID',
    message: 'Decision result is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static APPEAL_ALREADY_HAS_SUPPORTER: ErrorInfo = {
    key: 'APPEAL_ALREADY_HAS_SUPPORTER',
    message: 'Appeal already has admin supporter',
    type: ErrorType.BAD_REQUEST,
  };
  public static APPEAL_EMPTY_ADMIN_SUPPORTER: ErrorInfo = {
    key: 'APPEAL_EMPTY_ADMIN_SUPPORTER',
    message: 'Appeal are empty of admin supporter',
    type: ErrorType.BAD_REQUEST,
  };
  public static ADMIN_SUPPORTER_VIEW_APPEAL_PERMISSION_DENIED: ErrorInfo = {
    key: 'ADMIN_SUPPORTER_VIEW_APPEAL_PERMISSION_DENIED',
    message: 'admin supporter view appeal permission denied',
    type: ErrorType.BAD_REQUEST,
  };
  public static TOTAL_APPEAL_PICKED_LIMITS_ARE_EXCEEDED: ErrorInfo = {
    key: 'TOTAL_ORDER_PICKED_LIMITS_ARE_EXCEEDED',
    message: 'Total order picked limits are exceeded',
    type: ErrorType.BAD_REQUEST,
  };

  public static ORDER_NOT_FOUND: ErrorInfo = {
    key: 'ORDER_NOT_FOUND',
    message: 'Order not found',
    type: ErrorType.NOT_FOUND,
  };

  public static APPEAL_IS_DISABLED: ErrorInfo = {
    key: 'APPEAL_IS_DISABLED',
    message: 'Appeal is disabled',
    type: ErrorType.BAD_REQUEST,
  };
  public static PERMISSION_DENIED_TO_UPDATE_APPEAL: ErrorInfo = {
    key: 'PERMISSION_DENIED_TO_UPDATE_APPEAL',
    message: 'Permission denied to update',
    type: ErrorType.BAD_REQUEST,
  };
}
