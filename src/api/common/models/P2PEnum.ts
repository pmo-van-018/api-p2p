export enum PostStatus {
  OFFLINE = 0,
  ONLINE = 1,
  CLOSE = 2,
}

export enum TradeType {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum FileFormat {
  CSV = 'CSV',
  EXCEL = 'EXCEL',
}

export enum TradeTypeCSV {
  BUY = 'MUA',
  SELL = 'BÁN',
}

export enum PaymentMethodType {
  BANK = 'BANK',
  MOMO = 'MOMO',
}

// TOIMPROVE: will change value to uuid to prevent user easy guesss and modify.
export enum UserType {
  USER = 1,
}

export enum OperationType {
  SUPER_ADMIN = 2,
  MERCHANT_MANAGER = 3,
  MERCHANT_OPERATOR = 4,
  MERCHANT_SUPPORTER = 5,
  ADMIN_SUPPORTER = 6,
  SYSTEM_ADMIN = 7,
}

export enum OneSignalAppRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  OPERATION = 'OPERATION',
}

export enum UserStatus {
  ACTIVE = 1,
  INACTIVE = 2,
  BLOCKED = 3,
  DELETED = 4,
}

export enum WalletAddressStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum OperationStatus {
  ACTIVE = 1,
  INACTIVE = 2,
  BLOCKED = 3,
  DELETED = 4,
}

export enum ROLE_TYPE {
  USER = 'user',
  MERCHANT_OPERATOR = 'merchant_operator',
  MERCHANT_SUPPORTER = 'merchant_supporter',
  MERCHANT_MANAGER = 'merchant_manager',
  SUPER_ADMIN = 'super_admin',
  ADMIN_SUPPORTER = 'admin_supporter',
}

export enum MERCHANT_ROLE_TYPE {
  MERCHANT_OPERATOR = 4,
  MERCHANT_SUPPORTER = 5,
  MERCHANT_MANAGER = 3,
}

export enum ADMIN_ROLE_TYPE {
  SUPER_ADMIN = 2,
  ADMIN_SUPPORTER = 6,
  SYSTEM_ADMIN = 7,
}

/*
 * NOTE: network value have to mapping keys of env.rpc defined at src/api/env.ts
 * */
export enum BLOCKCHAIN_NETWORKS {
  VCHAIN = 'VChain',
  POLYGON = 'Polygon',
  BSC = 'BSC',
  ETHEREUM = 'Ethereum',
  TRON = 'Tron',
  KDONG = 'KDONG',
}

export const nativeTokenNetwork = {
  [BLOCKCHAIN_NETWORKS.KDONG]: {
    name: 'KDONG',
    symbol: 'KDG',
    precision: 18,
  },
};

export enum ASSET_NAMES {
  VIC = 'VIC',
  USDT = 'USDT',
}

export enum SupportedAsset {
  VIC_POLYGON = 'VIC (Polygon)',
  VIC_BSC = 'VIC (BSC)',
  USDT_POLYGON = 'USDT (Polygon)',
  USDT_BSC = 'USDT (BSC)',
  VIC_TRON = 'VIC (Tron)',
  USDT_TRON = 'USDT (Tron)',
  TRX_TRON = 'TRX (Tron)',
  KDG_KDONG = 'KDG (KDONG)',
}

export enum SupportedNetwork {
  POLYGON = 'Polygon',
  BSC = 'BSC',
  TRON = 'Tron',
  KDONG = 'KDONG',
}

export enum SupportedBank {
  VIETCOMBANK = 'vietcombank',
  VIETINBANK = 'vietinbank',
  TECHCOMBANK = 'techcombank',
  MB_BANK = 'mbbank',
  VP_BANK = 'vpbank',
  ACB = 'acb',
  BIDV = 'bidv',
  TP_BANK = 'tpbank',
  VIB = 'vib',
  AGRIBANK = 'agribank',
  HDBANK = 'hdbank',
  SACOMBANK = 'sacombank',
  SHB = 'shb',
  OCB = 'ocb',
  MSB = 'msb',
  ABBANK = 'abbank',
  BACABANK = 'bacabank',
  DONGABANK = 'dongabank',
  EXIMBANK = 'eximbank',
  GPBANK = 'gpbank',
  HSBC = 'hsbc',
  NAMABANK = 'namabank',
  NBC = 'ncb',
  PGBANK = 'pgbank',
  PVCOMBANK = 'pvcombank',
  SAIGONBANK = 'saigonbank',
  SCB = 'scb',
  SEABANK = 'seabank',
  VIETABANK = 'vietabank',
  VIETBANK = 'vietbank',
  VIETCAPITALBANK = 'vietcapitalbank',
  KIENLONGBANK = 'kienlongbank',
  LIENVIETPOSTBANK = 'lienvietpostbank',
}

export enum NotificationStatus {
  UNREAD = 0,
  READ = 1,
}

export enum NOTIFICATION_TYPE {
  // Buy
  BUY_ORDER_CREATED_BY_USER = 'buyOrderCreatedByUser',
  BUY_ORDER_USER_APPEAL_TO_MERCHANT = 'buyOrderUserAppealToMerchant',
  BUY_ORDER_USER_APPEAL_TO_ADMIN = 'buyOrderUserAppealToAdmin',
  BUY_ORDER_DEAL_TIME = 'buyOrderDealTime',

  BUY_ORDER_CLOSE_APPEAL_MERCHANT_REFUNDED_TO_USER = 'buyOrderCloseAppealMerchantRefundedToUser',
  BUY_ORDER_CLOSE_APPEAL_MERCHANT_REFUNDED_TO_MERCHANT = 'buyOrderCloseAppealMerchantRefundedToMerchant',
  BUY_ORDER_CLOSE_APPEAL_NOT_COMPLETE_TO_USER = 'buyOrderCloseAppealNotCompleteToUser',
  BUY_ORDER_CLOSE_APPEAL_NOT_COMPLETE_TO_MERCHANT = 'buyOrderCloseAppealNotCompleteToMerchant',

  BUY_ORDER_RESULT_APPEAL_MERCHANT_WIN_TO_MERCHANT = 'buyOrderResultAppealMerchantWinToMerchant',
  BUY_ORDER_RESULT_APPEAL_MERCHANT_WIN_TO_USER = 'buyOrderResultAppealMerchantWinToUser',

  BUY_ORDER_RESULT_APPEAL_USER_WIN_CANCEL_BUY_ORDER_TO_USER = 'buyOrderResultAppealUserWinCancelBuyOrderToUser',
  BUY_ORDER_RESULT_APPEAL_USER_WIN_CANCEL_BUY_ORDER_TO_MERCHANT = 'buyOrderResultAppealUserWinCancelBuyOrderToMerchant',
  BUY_ORDER_RESULT_APPEAL_USER_WIN_REOPEN_BUY_ORDER_TO_USER = 'buyOrderResultAppealUserWinReopenBuyOrderToUser',
  BUY_ORDER_RESULT_APPEAL_USER_WIN_REOPEN_BUY_ORDER_TO_MERCHANT = 'buyOrderResultAppealUserWinReopenBuyOrderToMerchant',

  BUY_ORDER_USER_AGREE_TO_MERCHANT_SEND_TO_OPERATOR = 'buyOrderUserAgreeToMerchantSendToOperator',
  BUY_ORDER_USER_AGREE_TO_MERCHANT_SEND_TO_SUPPORTER = 'buyOrderUserAgreeToMerchantSendToSupporter',

  // Sell
  SELL_ORDER_CREATED_BY_USER = 'sellOrderCreatedByUser',
  SELL_ORDER_USER_APPEAL_TO_MERCHANT = 'sellOrderUserAppealToMerchant',
  SELL_ORDER_USER_APPEAL_TO_ADMIN = 'sellOrderUserAppealToAdmin',
  SELL_ORDER_DEAL_TIME = 'sellOrderDealTime',

  SELL_ORDER_CLOSE_APPEAL_MERCHANT_REFUNDED_TO_USER = 'sellOrderCloseAppealMerchantRefundedToUser',
  SELL_ORDER_CLOSE_APPEAL_MERCHANT_REFUNDED_TO_MERCHANT = 'sellOrderCloseAppealMerchantRefundedToMerchant',

  SELL_ORDER_RESULT_APPEAL_MERCHANT_WIN_TO_USER = 'sellOrderResultAppealMerchantWinToUser',
  SELL_ORDER_RESULT_APPEAL_MERCHANT_WIN_TO_MERCHANT = 'sellOrderResultAppealMerchantWinToMerchant',
  SELL_ORDER_RESULT_APPEAL_USER_WIN_REFUND_TO_USER = 'sellOrderResultAppealUserWinRefundToUser',
  SELL_ORDER_RESULT_APPEAL_USER_WIN_REFUND_TO_MERCHANT = 'sellOrderResultAppealUserWinRefundToMerchant',

  BANK_DELETE_PAYMENT_METHOD_ADS_BY_MANAGER = 'bankDeletePaymentMethodAdsByManager',
  BANK_UPDATE_PAYMENT_METHOD_ADS_BY_MANAGER = 'bankUpdatePaymentMethodAdsByManager',

  SELL_ORDER_USER_AGREE_TO_MERCHANT_SEND_TO_OPERATOR = 'sellOrderUserAgreeToMerchantSendToOperator',
  SELL_ORDER_USER_AGREE_TO_MERCHANT_SEND_TO_SUPPORTER = 'sellOrderUserAgreeToMerchantSendToSupporter',
  SELL_ORDER_HAS_TRANSACTION_UNKNOWN_ERROR_TO_ADMIN_SUPPORTER = 'sellOrderHasTransactionUnknownErrorToAdminSupporter',
  SELL_ORDER_HAS_TRANSACTION_UNKNOWN_ERROR_TO_OPERATOR = 'sellOrderHasTransactionUnknownErrorToOperator',

  // System
  SYSTEM_CHANGE_ADS_TO_OFFLINE_AMOUNT_LOWER_FIAT = 'systemChangeAdsToOfflineAmountLowerFiat',
  SYSTEM_CHANGE_ADS_TO_CLOSE_AMOUNT_0 = 'systemChangeAdsToCloseAmount0',

  BANK_DELETE_PAYMENT_METHOD_TO_USER = 'bankDeletePaymentMethodToUser',
  BANK_DELETE_PAYMENT_METHOD_TO_MERCHANT = 'bankDeletePaymentMethodToMerchant',
  BANK_DELETE_PAYMENT_METHOD_ADS_TO_OFFLINE = 'bankDeletePaymentMethodAdsToOffline',

  ADMIN_DISABLE_MERCHANT_OPERATOR = 'adminDisableMerchantOperator',
  ADMIN_DISABLE_MERCHANT_OPERATOR_HAS_PENDING_ORDER = 'adminDisableMerchantOperatorHasPendingOrder',

  ADMIN_DISABLE_MERCHANT_SUPPORTER = 'adminDisableMerchantSupporter',

  ADMIN_NOTIFY_ENABLE_MERCHANT_OPERATOR_TO_MANAGER = 'adminNotifyEnableMerchantOperatorToManager',
  ADMIN_NOTIFY_ENABLE_MERCHANT_OPERATOR_TO_OPERATOR = 'adminNotifyEnableMerchantOperatorToOperator',
  MANAGER_NOTIFY_ENABLE_MERCHANT_OPERATOR_TO_OPERATOR = 'managerNotifyEnableMerchantOperatorToOperator',

  ADMIN_NOTIFY_ENABLE_MERCHANT_SUPPORTER_TO_MANAGER = 'adminNotifyEnableMerchantSupporterToManager',
  ADMIN_NOTIFY_ENABLE_MERCHANT_SUPPORTER_TO_SUPPORTER = 'adminNotifyEnableMerchantSupporterToSupporter',
  MANAGER_NOTIFY_ENABLE_MERCHANT_SUPPORTER_TO_SUPPORTER = 'managerNotifyEnableMerchantSupporterToSupporter',

  ADMIN_ENABLE_MERCHANT_MANAGER_TO_MANAGER = 'adminEnableMerchantManagerToManager',
  ADMIN_ENABLE_MERCHANT_MANAGER_TO_MERCHANT = 'adminEnableMerchantManagerToMerchant',

  ADMIN_NOTIFY_MERCHANT_SUPPORTER_ORDER_IS_COMPLETED = 'adminNotifyMerchantSupporterOrderIsCompleted',
  ADMIN_NOTIFY_MERCHANT_SUPPORTER_ORDER_IS_CANCELED = 'adminNotifyMerchantSupporterOrderIsCanceled',

  SUPPORTER_RECEIVE_APPEAL_ORDER = 'supporterReceivAppealOrderAppealOrder',
  ORDER_CANCELLED_BY_USER = 'orderCancelledByUser',
  ORDER_CANCELLED_BY_SYSTEM = 'orderCancelledBySystem',

  ASSET_DISABLED_BY_ADMIN = 'assetDisabledByAdmin',
  ADMIN_ACTIVE_ADMIN_SUPPORTER = 'adminActiveAdminSupporter',
  ADMIN_SUPPORTER_PICK_APPEAL = 'adminSupporterPickAppeal',
  ADMIN_CANCEL_SESSION_APPEAL = 'adminCancelSessionAppeal',

  USER_REQUEST_SUPPORT_TO_ADMIN_SUPPORT = 'userRequestSupportToAdminSupport',
  USER_REQUEST_SUPPORT_TO_SUPPER_ADMIN = 'userRequestSupportToSupperAdmin',

  MANAGER_ACTIVE_WALLET_ADDRESS_TO_ADMIN = 'MANAGER_ACTIVE_WALLET_ADDRESS_TO_ADMIN',
  MANAGER_ACTIVE_WALLET_ADDRESS_TO_STAFF = 'MANAGER_ACTIVE_WALLET_ADDRESS_TO_STAFF',
  ADMIN_ACTIVE_WALLET_ADDRESS_TO_MERCHANT = 'ADMIN_ACTIVE_WALLET_ADDRESS_TO_MERCHANT',

  MANAGER_CHANGED_POST_STATUS_TO_ONLINE = 'MANAGER_CHANGED_POST_STATUS_TO_ONLINE',
  MANAGER_CHANGED_POST_STATUS_TO_OFFLINE = 'MANAGER_CHANGED_POST_STATUS_TO_OFFLINE',
  MANAGER_UPDATE_POSTING_TO_OPERATOR = 'MANAGER_UPDATE_POSTING_TO_OPERATOR',

  SUPER_ADMIN_ACTIVED = 'SUPER_ADMIN_ACTIVED',

  // System configuration
  ADMIN_UPDATE_PAYMENT_METHOD_LIMIT_USER = 'adminUpdatePaymentMethodLimitUser',
  ADMIN_UPDATE_PAYMENT_METHOD_LIMIT_MANAGER = 'adminUpdatePaymentMethodLimitManager',
  ADMIN_UPDATE_APPEAL_LIMIT_MERCHANT_SUPPORTER = 'adminUpdatePickTimeLimitMerchantSupporter',
  ADMIN_UPDATE_APPEAL_LIMIT_ADMIN_SUPPORTER = 'adminUpdatePickTimeAppealLimitAdminSupporter',
  ADMIN_UPDATE_CUSTOMER_REQUEST_LIMIT_ADMIN_SUPPORTER = 'adminUpdateCustomerRequestLimitAdminSupporter',
  ADMIN_UPDATE_EVIDENCE_TIME_LIMIT = 'adminUpdateEvidenceTimeLimit',
  ADMIN_UPDATE_CRYPTO_TRANSFER_TIME_LIMIT = 'adminUpdateCryptoTransferTimeLimit',

  // Balance configuration
  MANAGER_UPDATE_BALANCE_CONFIGURATION = 'managerUpdateBalanceConfiguration',
  OPERATOR_REACHED_THRESHOLD_OF_BALANCE = 'operatorReachedThresholdOfBalance',

  // Admin setting gasless
  ADMIN_ENABLE_GASLESS_TO_MANAGER = 'ADMIN_ENABLE_GASLESS_TO_MANAGER',
  ADMIN_DISABLE_GASLESS_TO_MANAGER = 'ADMIN_DISABLE_GASLESS_TO_MANAGER',
}

export enum NotificationType {
  ALL = 0,
  TRANSACTION = 1,
  SYSTEM = 2,
  LOGIN = 3,
}

export enum GetSortedSetType {
  maximum = 'maximum',
  minimum = 'minimum',
}

export enum PostStatusReport {
  'Ngoại tuyến',
  'Trực tuyến',
  'Đã đóng',
}

export enum ReportType {
  ORDER_HISTORIES = 'ORDER_HISTORIES',
  POST_HISTORIES = 'POST_HISTORIES',
  REVENUE = 'REVENUE',
  ASSET = 'ASSET',
  TRADE_TYPE_DIFFERENCE = 'TRADE_TYPE_DIFFERENCE',
  MANAGER_STATISTIC = 'MANAGER_STATISTIC',
  STAFF_STATISTIC = 'STAFF_STATISTIC',
  USER_STATISTIC = 'USER_STATISTIC',
}

export enum SearchType {
  WALLET_ADDRESS = 'WALLET_ADDRESS',
  NICK_NAME = 'NICK_NAME',
}

export enum StaffType {
  OPERATOR = 'OPERATOR',
  SUPPORTER = 'SUPPORTER',
}

export enum GroupTypeRevenue {
  DAY = 'DAY',
  MONTH = 'MONTH',
  YEAR = 'YEAR',
}

export enum RevenueMaxRangeTime {
  DAY = 15,
  MONTH = 12,
  YEAR = 6,
}

export enum SupportedWallet {
  METAMASK = 'METAMASK',
  TRUSTWALLET = 'TRUSTWALLET',
  BINANCE = 'BINANCE',
  COINBASE = 'COINBASE',
  TRONLINK = 'TRONLINK',
  WALLETCONNECT = 'WALLETCONNECT',
}

export enum ConfirmationTransactionResult {
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}
