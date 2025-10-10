import { ErrorInfo, ErrorType } from '@api/infrastructure/helpers/ErrorInfo';

export class SupportRequestError {
  public static SUPPORT_TYPE_IS_INVALID: ErrorInfo = {
    key: 'SUPPORT_TYPE_IS_INVALID',
    message: 'Support type is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static EXISTING_REQUEST_SUPPORT: ErrorInfo = {
    key: 'EXISTING_REQUEST_SUPPORT',
    message: 'Existing request support',
    type: ErrorType.BAD_REQUEST,
  };
  public static TOTAL_REQUEST_PICKED_LIMITS_ARE_EXCEEDED: ErrorInfo = {
    key: 'TOTAL_REQUEST_PICKED_LIMITS_ARE_EXCEEDED',
    message: 'Total request picked limits are exceeded',
    type: ErrorType.BAD_REQUEST,
  };
  public static SUPPORT_REQUEST_NOT_FOUND: ErrorInfo = {
    key: 'SUPPORT_REQUEST_NOT_FOUND',
    message: 'Support request not found',
    type: ErrorType.NOT_FOUND,
  };
  public static SUPPORT_REQUEST_STATUS_IS_INVALID: ErrorInfo = {
    key: 'SUPPORT_REQUEST_STATUS_IS_INVALID',
    message: 'Support request status is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static CANNOT_RESOLVE_SUPPORT_REQUEST: ErrorInfo = {
    key: 'CANNOT_RESOLVE_SUPPORT_REQUEST',
    message: 'Cannot resolve support request',
    type: ErrorType.BAD_REQUEST,
  };
  public static CREATE_SUPPORT_REQUEST_FAILED: ErrorInfo = {
    key: 'CREATE_SUPPORT_REQUEST_FAILED',
    message: 'Create request support failed',
    type: ErrorType.INTERNAL_SERVER,
  };
  public static RECEIVE_SUPPORT_REQUEST_FAILED: ErrorInfo = {
    key: 'RECEIVE_SUPPORT_REQUEST_FAILED',
    message: 'Receive request support failed',
    type: ErrorType.INTERNAL_SERVER,
  };
  public static GET_SUPPORT_REQUEST_LIST_FAILED: ErrorInfo = {
    key: 'GET_SUPPORT_REQUEST_LIST_FAILED',
    message: 'Get support request list failed',
    type: ErrorType.INTERNAL_SERVER,
  };
  public static GET_SUPPORT_REQUEST_FAILED: ErrorInfo = {
    key: 'GET_SUPPORT_REQUEST_FAILED',
    message: 'Get support request failed',
    type: ErrorType.INTERNAL_SERVER,
  };
  public static RESOLVE_SUPPORT_REQUEST_FAILED: ErrorInfo = {
    key: 'RESOLVE_SUPPORT_REQUEST_FAILED',
    message: 'Resolve support request  failed',
    type: ErrorType.INTERNAL_SERVER,
  };
  public static SUPPORT_REQUEST_ALREADY_RECEIVED: ErrorInfo = {
    key: 'SUPPORT_REQUEST_ALREADY_RECEIVED',
    message: 'Support request is already received',
    type: ErrorType.BAD_REQUEST,
  };
  public static ADMIN_SUPPORTER_VIEW_SUPPORT_REQUEST_PERMISSION_DENIED: ErrorInfo = {
    key: 'ADMIN_SUPPORTER_VIEW_SUPPORT_REQUEST_PERMISSION_DENIED',
    message: 'admin supporter view support request permission denied',
    type: ErrorType.BAD_REQUEST,
  };
}
