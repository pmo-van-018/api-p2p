import { ErrorInfo, ErrorType } from '@api/infrastructure/helpers/ErrorInfo';

export class OrderLifeCycleError {
  public static PRICE_IS_INVALID: ErrorInfo = {
    key: 'PRICE_IS_INVALID',
    message: 'The price is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static AMOUNT_IS_GREATER_THAN_AVAILABLE_AMOUNT: ErrorInfo = {
    key: 'AMOUNT_IS_GREATER_THAN_AVAILABLE_AMOUNT',
    message: 'Order amount is greater than posting available amount',
    type: ErrorType.BAD_REQUEST,
  };
  public static AMOUNT_IS_LESS_THAN_POST_MIN_AMOUNT: ErrorInfo = {
    key: 'AMOUNT_IS_LESS_THAN_POST_MIN_AMOUNT',
    message: 'Order amount is less than posting minimum amount',
    type: ErrorType.BAD_REQUEST,
  };
  public static AMOUNT_IS_GREATER_THAN_POST_MAX_AMOUNT: ErrorInfo = {
    key: 'AMOUNT_IS_GREATER_THAN_POST_MAX_AMOUNT',
    message: 'Order amount is greater than posting maximum amount',
    type: ErrorType.BAD_REQUEST,
  };
  public static ORDER_CREATION_IS_FAILED: ErrorInfo = {
    key: 'ORDER_CREATION_IS_FAILED',
    message: 'Order creation is failed',
    type: ErrorType.BAD_REQUEST,
  };
  public static ORDER_UPDATED_IS_FAILED: ErrorInfo = {
    key: 'ORDER_UPDATED_IS_FAILED',
    message: 'Order updated is failed',
    type: ErrorType.BAD_REQUEST,
  };
  public static ORDER_NOT_FOUND: ErrorInfo = {
    key: 'ORDER_NOT_FOUND',
    message: 'Order not found',
    type: ErrorType.NOT_FOUND,
  };
  public static ORDER_ALREADY_HAS_SUPPORTER: ErrorInfo = {
    key: 'ORDER_ALREADY_HAS_SUPPORTER',
    message: 'Order already has supporter',
    type: ErrorType.BAD_REQUEST,
  };
  public static ORDER_STATUS_IS_INVALID: ErrorInfo = {
    key: 'ORDER_STATUS_IS_INVALID',
    message: 'Order status is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static ORDER_STEP_IS_INVALID: ErrorInfo = {
    key: 'ORDER_STEP_IS_INVALID',
    message: 'Order step is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static RPC_STATUS_IS_UPDATING: ErrorInfo = {
    key: 'RPC_STATUS_IS_UPDATING',
    message: 'RPC status is updating',
    type: ErrorType.BAD_REQUEST,
  };
  public static ORDER_TYPE_IS_INVALID: ErrorInfo = {
    key: 'ORDER_TYPE_IS_INVALID',
    message: 'Order type is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static ORDER_STATUS_IS_CANCELLED_OR_FINISHED: ErrorInfo = {
    key: 'ORDER_STATUS_IS_CANCELLED_OR_FINISHED',
    message: 'The order has been cancelled or finished the steps from user.',
    type: ErrorType.BAD_REQUEST,
  };
  public static SELL_ORDER_STATUS_IS_INVALID: ErrorInfo = {
    key: 'SELL_ORDER_STATUS_IS_INVALID',
    message: 'Sell order has been done or successfully cancelled from user side.',
    type: ErrorType.BAD_REQUEST,
  };
  public static FIAT_PAYMENT_TIME_IS_EXPIRED: ErrorInfo = {
    key: 'FIAT_PAYMENT_TIME_IS_EXPIRED',
    message: 'The fiat payment time is expired',
    type: ErrorType.BAD_REQUEST,
  };
  public static SENDING_FIAT_CONFIRMATION_IS_FAILED: ErrorInfo = {
    key: 'SENDING_FIAT_CONFIRMATION_IS_FAILED',
    message: 'Sending fiat confirmation is failed',
    type: ErrorType.BAD_REQUEST,
  };
  public static CANCEL_TIMEOUT: ErrorInfo = {
    key: 'CANCEL_TIMEOUT',
    message: 'Operation cancel order is timeout',
    type: ErrorType.BAD_REQUEST,
  };
  public static SELL_ORDER_TIMEOUT: ErrorInfo = {
    key: 'SELL_ORDER_TIMEOUT',
    message: 'Operation cancel order is timeout',
    type: ErrorType.BAD_REQUEST,
  };
  public static ORDER_CANCELATION_FAILED: ErrorInfo = {
    key: 'ORDER_CANCELATION_FAILED',
    message: 'Buy order cancelation is failed.',
    type: ErrorType.BAD_REQUEST,
  };
  public static SELL_ORDER_CANCELLATION_FAILED: ErrorInfo = {
    key: 'SELL_ORDER_CANCELLATION_FAILED',
    message: 'Sell order cancellation is failed.',
    type: ErrorType.BAD_REQUEST,
  };
  public static CONFIRM_PAID_INVALID: ErrorInfo = {
    key: 'CONFIRM_PAID_INVALID',
    message: 'Merchant confirm paid is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static CRYPTO_PAYMENT_TIME_IS_EXPIRED: ErrorInfo = {
    key: 'CRYPTO_PAYMENT_TIME_IS_EXPIRED',
    message: 'The crypto payment time is expired',
    type: ErrorType.BAD_REQUEST,
  };
  public static RECEIVING_FIAT_CONFIRMATION_IS_FAILED: ErrorInfo = {
    key: 'RECEIVING_FIAT_CONFIRMATION_IS_FAILED',
    message: 'Receiving fiat confirmation is failed',
    type: ErrorType.BAD_REQUEST,
  };
  public static FIAT_CONFIRMATION_IS_FAILED: ErrorInfo = {
    key: 'FIAT_CONFIRMATION_IS_FAILED',
    message: 'Sending fiat confirmation is failed',
    type: ErrorType.BAD_REQUEST,
  };
  public static SUBMIT_CRYPTO_TRANSACTION_FAIL: ErrorInfo = {
    key: 'SUBMIT_CRYPTO_TRANSACTION_FAIL',
    message: 'Merchant submit crypto transaction failed',
    type: ErrorType.BAD_REQUEST,
  };
  public static CRYPTO_TRANSACTION_IS_FAILED: ErrorInfo = {
    key: 'CRYPTO_TRANSACTION_IS_FAILED',
    message: 'Operation submit crypto transaction failed',
    type: ErrorType.BAD_REQUEST,
  };
  public static GET_ORDER_DETAIL_FAIL: ErrorInfo = {
    key: 'GET_ORDER_DETAIL_FAIL',
    message: 'Operation get order detail failed',
    type: ErrorType.INTERNAL_SERVER,
  };
  public static GET_ORDER_LIST_FAIL: ErrorInfo = {
    key: 'GET_ORDER_LIST_FAIL',
    message: 'Operation get orders list failed',
    type: ErrorType.BAD_REQUEST,
  };
  public static USER_HAS_A_PENDING_BUY_ORDER: ErrorInfo = {
    key: 'USER_HAS_A_PENDING_BUY_ORDER',
    message: 'Operation has a pending buy order',
    type: ErrorType.BAD_REQUEST,
  };
  public static USER_HAS_A_PENDING_SELL_ORDER: ErrorInfo = {
    key: 'USER_HAS_A_PENDING_SELL_ORDER',
    message: 'Operation has a pending sell order',
    type: ErrorType.BAD_REQUEST,
  };
  public static USER_VIOLATES_BUY_ORDER_RULES: ErrorInfo = {
    key: 'USER_VIOLATES_BUY_ORDER_RULES',
    message: 'Operation violates buy order rules with 5 times of order cancellation in 24 hours',
    type: ErrorType.BAD_REQUEST,
  };
  public static USER_VIOLATES_SELL_ORDER_RULES: ErrorInfo = {
    key: 'USER_VIOLATES_SELL_ORDER_RULES',
    message: 'Operation violates sell order rules with 5 times of order cancellation in 24 hours',
    type: ErrorType.BAD_REQUEST,
  };
  public static ORDER_IS_COMPLETED: ErrorInfo = {
    key: 'ORDER_IS_COMPLETED',
    message: 'The order is completed',
    type: ErrorType.BAD_REQUEST,
  };
  public static SYSTEM_UPDATE_AUTO_CANCEL_FAIL: ErrorInfo = {
    key: 'SYSTEM_UPDATE_AUTO_CANCEL_FAIL',
    message: 'The system update order auto cancel fail',
    type: ErrorType.INTERNAL_SERVER,
  };
  public static SYSTEM_UPDATE_CANCELLATION_FAILED: ErrorInfo = {
    key: 'SYSTEM_UPDATE_CANCELLATION_FAILED',
    message: 'The system update order cancel status fail',
    type: ErrorType.INTERNAL_SERVER,
  };
  public static SYSTEM_AUTO_CANCEL_COUNTDOWN_EXIST: ErrorInfo = {
    key: 'SYSTEM_AUTO_CANCEL_COUNTDOWN_EXIST',
    message: 'The order auto cancel countdown exist',
    type: ErrorType.INTERNAL_SERVER,
  };
  public static SEARCH_ORDER_FAIL: ErrorInfo = {
    key: 'SEARCH_ORDER_FAIL',
    message: 'The orders exist',
    type: ErrorType.BAD_REQUEST,
  };
  public static CREATE_APPEAL_FAILED: ErrorInfo = {
    key: 'CREATE_APPEAL_FAILED',
    message: 'Create appeal failed',
    type: ErrorType.BAD_REQUEST,
  };
  public static APPEAL_PERMISSION_DENIED: ErrorInfo = {
    key: 'APPEAL_PERMISSION_DENIED',
    message: 'Permission denied',
    type: ErrorType.BAD_REQUEST,
  };
  public static APPEAL_IS_DISABLED: ErrorInfo = {
    key: 'APPEAL_IS_DISABLED',
    message: 'Appeal is disabled',
    type: ErrorType.BAD_REQUEST,
  };
  public static REQUEST_JUDGE_DISABLED: ErrorInfo = {
    key: 'REQUEST_JUDGE_DISABLED',
    message: 'Request judge is disabled',
    type: ErrorType.BAD_REQUEST,
  };
  public static TOTAL_ORDER_SUPPORT_LIMITS_ARE_EXCEEDED: ErrorInfo = {
    key: 'TOTAL_ORDER_SUPPORT_LIMITS_ARE_EXCEEDED',
    message: 'Total order support limits are exceeded',
    type: ErrorType.BAD_REQUEST,
  };
  public static RESOLVE_APPEAL_PERMISSION_DENIED: ErrorInfo = {
    key: 'RESOLVE_APPEAL_PERMISSION_DENIED',
    message: 'Resolve appeal permisson denied',
    type: ErrorType.BAD_REQUEST,
  };
  public static APPEAL_ALREADY_RESOLVED: ErrorInfo = {
    key: 'APPEAL_ALREADY_RESOLVED',
    message: 'Appeal already resolved',
    type: ErrorType.BAD_REQUEST,
  };
  public static TOTAL_ORDER_PICKED_LIMITS_ARE_EXCEEDED: ErrorInfo = {
    key: 'TOTAL_ORDER_PICKED_LIMITS_ARE_EXCEEDED',
    message: 'Total order picked limits are exceeded',
    type: ErrorType.BAD_REQUEST,
  };
  public static PERMISSION_DENIED_TO_UPDATE_APPEAL: ErrorInfo = {
    key: 'PERMISSION_DENIED_TO_UPDATE_APPEAL',
    message: 'Permission denied to update',
    type: ErrorType.BAD_REQUEST,
  };
  public static MERCHANT_SUPPORTER_PICK_APPEAL_FAILED: ErrorInfo = {
    key: 'MERCHANT_SUPPORTER_PICK_APPEAL_FAILED',
    message: 'Merchant supporter pick appeal failed',
    type: ErrorType.INTERNAL_SERVER,
  };
  public static NETWORK_NOT_SUPPORTED: ErrorInfo = {
    key: 'NETWORK_NOT_SUPPORTED',
    message: 'Network not supported',
    type: ErrorType.BAD_REQUEST,
  };
  public static PAYMENT_METHOD_NOT_FOUND: ErrorInfo = {
    key: 'PAYMENT_METHOD_NOT_FOUND',
    message: 'Payment method not found',
    type: ErrorType.BAD_REQUEST,
  };
  public static OPERATOR_NOT_OWN_ORDER: ErrorInfo = {
    key: 'OPERATOR_NOT_OWN_ORDER',
    message: 'Operator not own order',
    type: ErrorType.BAD_REQUEST,
  };
  public static ORDER_HAS_ROOM_CHAT_ALREADY: ErrorInfo = {
    key: 'ORDER_HAS_ROOM_CHAT_ALREADY',
    message: 'Order has room chat already',
    type: ErrorType.BAD_REQUEST,
  };
  public static TRANSACTION_NOT_FOUND: ErrorInfo = {
    key: 'TRANSACTION_NOT_FOUND',
    message: 'Transaction not found',
    type: ErrorType.BAD_REQUEST,
  };
  public static TRANSACTION_STATUS_INVALID: ErrorInfo = {
    key: 'TRANSACTION_STATUS_INVALID',
    message: 'Transaction status is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static ORDER_UPDATE_IS_FAILED: ErrorInfo = {
    key: 'ORDER_UPDATE_IS_FAILED',
    message: 'Order update is failed',
    type: ErrorType.BAD_REQUEST,
  };
  public static ORDER_HAS_CONFIRMED: ErrorInfo = {
    key: 'ORDER_HAS_CONFIRMED',
    message: 'Order has confirmed',
    type: ErrorType.BAD_REQUEST,
  };
  public static ORDER_ROOM_ID_IS_INVALID: ErrorInfo = {
    key: 'ORDER_ROOM_ID_IS_INVALID',
    message: 'Order room id is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static ORDER_ROOM_ID_ALREADY_EXIST: ErrorInfo = {
    key: 'ORDER_ROOM_ID_ALREADY_EXIST',
    message: 'Order room id already exist',
    type: ErrorType.BAD_REQUEST,
  };
  public static CREATE_PAYMENT_TICKET_IS_FAILED: ErrorInfo = {
    key: 'CREATE_PAYMENT_TICKET_IS_FAILED',
    message: 'Create payment ticket is failed',
    type: ErrorType.BAD_REQUEST,
  };
  public static CREATE_PAYMENT_TICKET_FORBIDDEN: ErrorInfo = {
    key: 'CREATE_PAYMENT_TICKET_FORBIDDEN',
    message: 'Create payment ticket is forbidden',
    type: ErrorType.BAD_REQUEST
  };
  public static PAYMENT_TICKET_NOT_FOUND: ErrorInfo = { 
    key: 'PAYMENT_TICKET_NOT_FOUND',
    message: 'Payment ticket not found',
    type: ErrorType.BAD_REQUEST,
  };
  public static PAYMENT_TICKET_STATUS_IS_INVALID: ErrorInfo = {
    key: 'PAYMENT_TICKET_STATUS_IS_INVALID',
    message: 'Payment ticket status is invalid',
    type: ErrorType.BAD_REQUEST,
  };
  public static CANCEL_PAYMENT_TICKET_IS_FAILED: ErrorInfo = {
    key: 'CANCEL_PAYMENT_TICKET_IS_FAILED',
    message: 'Cancel payment ticket is failed',
    type: ErrorType.BAD_REQUEST,
  };
  public static CANCEL_PAYMENT_TICKET_FORBIDDEN: ErrorInfo = {
    key: 'CANCEL_PAYMENT_TICKET_FORBIDDEN',
    message: 'Cancel payment ticket is forbidden',
    type: ErrorType.BAD_REQUEST
  };
  public static UPDATE_PAYMENT_TICKET_IS_FAILED: ErrorInfo = {
    key: 'UPDATE_PAYMENT_TICKET_IS_FAILED',
    message: 'Update payment ticket is failed',
    type: ErrorType.BAD_REQUEST,
  };
  public static PICK_PAYMENT_TICKET_IS_FAILED: ErrorInfo = {
    key: 'PICK_PAYMENT_TICKET_IS_FAILED',
    message: 'Pick payment ticket is failed',
    type: ErrorType.BAD_REQUEST,
  };
  public static PAYMENT_TICKET_IS_EXIST: ErrorInfo = {
    key: 'PAYMENT_TICKET_IS_EXIST',
    message: 'Payment ticket is exist',
    type: ErrorType.BAD_REQUEST,
  };
  public static BANK_NOT_SUPPORT: ErrorInfo = {
    key: 'BANK_NOT_SUPPORT',
    message: 'Bank not support',
    type: ErrorType.BAD_REQUEST,
  };
}
