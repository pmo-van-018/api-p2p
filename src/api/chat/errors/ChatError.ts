import { ErrorInfo, ErrorType } from '@api/infrastructure/helpers/ErrorInfo';

export class ChatError {
  public static CHAT_NOT_AVAILABLE: ErrorInfo = {
    key: 'CHAT_NOT_AVAILABLE',
    message: 'Chat not available',
    type: ErrorType.BAD_REQUEST,
  };
  public static PERMISSION_DENIED: ErrorInfo = {
    key: 'APPEAL_PERMISSION_DENIED',
    message: 'permission denied',
    type: ErrorType.FORBIDDEN,
  };
  public static ORDER_NOT_FOUND: ErrorInfo = {
    key: 'ORDER_NOT_FOUND',
    message: 'Order not found',
    type: ErrorType.NOT_FOUND,
  };
  public static ROOM_IS_EXISTED: ErrorInfo = {
    key: 'ROOM_IS_EXISTED',
    message: 'Room is existed',
    type: ErrorType.BAD_REQUEST,
  };
  public static OPERATOR_CANNOT_CREATE_ROOM_CHAT: ErrorInfo = {
    key: 'OPERATOR_CANNOT_CREATE_ROOM_CHAT',
    message: 'Not correct condition for operator to create chat room',
    type: ErrorType.BAD_REQUEST,
  };
}
