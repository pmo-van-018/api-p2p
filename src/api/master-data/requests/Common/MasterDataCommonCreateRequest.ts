import { IsArray, IsEnum, IsInt, IsOptional, IsNumber, IsPositive, Min, ArrayNotEmpty, Max, IsIn } from 'class-validator';
import { SupportedAsset, SupportedBank } from '@api/common/models/P2PEnum';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  MASTER_DATA_COMMON_DEFAULT,
  MASTER_DATA_COMMON_MIN_VALUE, MAX_APPEAL_RECEIVE_LIMIT, MAX_ASK_TIME,
  MAX_CRYPTO_TRANSACTION_TIME_LIMIT,
  MAX_EVIDENCE_TIME_LIMIT,
  MAX_PAYMENT_METHOD_LIMIT, MAX_SUPPORT_REQUEST_LIMIT,
  TIME_BUY,
  TIME_SELL,
} from '@api/common/models/P2PConstant';
import { MaxFee, MaxFiat } from '@api/common/validations/Max';
import { IsGreaterThan } from '@api/common/validations/IsGreaterThan';
import { ValidateError } from '@api/master-data/errors/ValidateError';
import { ConvertToUniqueArr } from '@api/common/transformer/ConvertToUniqueArr';

export class MasterDataCommonCreateRequest {
  @IsOptional()
  @IsArray({ context: ValidateError.SUPPORTED_BANKS_INVALID })
  @ArrayNotEmpty({ context: ValidateError.SUPPORTED_BANKS_INVALID })
  @IsEnum(SupportedBank, { each: true })
  @ConvertToUniqueArr()
  public supportedBanks?: SupportedBank[];

  @IsOptional()
  @IsEnum(TIME_BUY, { each: true, context: ValidateError.MERCHANT_TO_USER_TIME_BUY_LIST_INVALID })
  @IsArray({ context: ValidateError.MERCHANT_TO_USER_TIME_BUY_LIST_INVALID })
  @ArrayNotEmpty({ context: ValidateError.MERCHANT_TO_USER_TIME_BUY_LIST_INVALID })
  public merchantToUserTimeBuys?: number[];

  @IsOptional()
  @IsEnum(TIME_SELL, { each: true, context: ValidateError.MERCHANT_TO_USER_TIME_SELL_LIST_INVALID })
  @IsArray({ context: ValidateError.MERCHANT_TO_USER_TIME_SELL_LIST_INVALID })
  @ArrayNotEmpty({ context: ValidateError.MERCHANT_TO_USER_TIME_SELL_LIST_INVALID })
  public merchantToUserTimeSells?: number[];

  @IsOptional()
  @IsEnum(TIME_BUY, { each: true, context: ValidateError.USER_TO_MERCHANT_TIME_BUY_LIST_INVALID })
  @IsArray({ context: ValidateError.USER_TO_MERCHANT_TIME_BUY_LIST_INVALID })
  @ArrayNotEmpty({ context: ValidateError.USER_TO_MERCHANT_TIME_BUY_LIST_INVALID })
  public userToMerchantTimeBuys?: number[];

  @IsOptional()
  @IsEnum(TIME_SELL, { each: true, context: ValidateError.USER_TO_MERCHANT_TIME_SELL_LIST_INVALID })
  @IsArray({ context: ValidateError.USER_TO_MERCHANT_TIME_SELL_LIST_INVALID })
  @ArrayNotEmpty({ context: ValidateError.USER_TO_MERCHANT_TIME_SELL_LIST_INVALID })
  public userToMerchantTimeSells?: number[];

  @IsOptional()
  @IsEnum(SupportedAsset, { each: true, context: ValidateError.SUPPORTED_ASSETS_INVALID })
  @IsArray({ context: ValidateError.SUPPORTED_ASSETS_INVALID })
  @ArrayNotEmpty({ context: ValidateError.SUPPORTED_ASSETS_INVALID })
  @ConvertToUniqueArr()
  public assetNetworkTypes?: SupportedAsset[];

  @IsOptional()
  @Min(MASTER_DATA_COMMON_MIN_VALUE.MIN_ORDER_LIMIT, { context: ValidateError.LIMIT_INPUT_NOT_ALLOWED_BY_SYSTEM })
  @MaxFiat({ context: ValidateError.LIMIT_INPUT_NOT_ALLOWED_BY_SYSTEM })
  @IsInt({ context: ValidateError.MIN_ORDER_LIMIT_INVALID })
  public minOrderLimit?: number;

  @IsOptional()
  @IsGreaterThan('minOrderLimit', { context: ValidateError.MAX_ORDER_LIMIT_IS_SMALLER_THAN_MIN_ORDER_LIMIT })
  @Min(MASTER_DATA_COMMON_MIN_VALUE.MAX_ORDER_LIMIT, { context: ValidateError.LIMIT_INPUT_NOT_ALLOWED_BY_SYSTEM })
  @MaxFiat({ context: ValidateError.LIMIT_INPUT_NOT_ALLOWED_BY_SYSTEM })
  @IsInt({ context: ValidateError.MAX_ORDER_LIMIT_INVALID })
  public maxOrderLimit?: number;

  @IsOptional()
  @Min(MASTER_DATA_COMMON_MIN_VALUE.MIN_POST_LIMIT, { context: ValidateError.LIMIT_INPUT_NOT_ALLOWED_BY_SYSTEM })
  @MaxFiat({ context: ValidateError.LIMIT_INPUT_NOT_ALLOWED_BY_SYSTEM })
  @IsInt({ context: ValidateError.MIN_POST_LIMIT_INVALID })
  public minPostLimit?: number;

  @IsOptional()
  @Min(MASTER_DATA_COMMON_MIN_VALUE.MAX_POST_LIMIT, { context: ValidateError.LIMIT_INPUT_NOT_ALLOWED_BY_SYSTEM })
  @IsGreaterThan('minPostLimit', { context: ValidateError.MAX_POST_LIMIT_IS_SMALLER_THAN_MIN_POST_LIMIT })
  @MaxFiat({ context: ValidateError.LIMIT_INPUT_NOT_ALLOWED_BY_SYSTEM })
  @IsInt({ context: ValidateError.MAX_POST_LIMIT_INVALID })
  public maxPostLimit?: number;

  @IsOptional()
  @IsPositive({ context: ValidateError.USER_ASK_MERCHANT_TIME_IS_INVALID })
  @Min(MASTER_DATA_COMMON_MIN_VALUE.USER_ASK_MERCHANT_TIME, { context: ValidateError.LIMIT_INPUT_NOT_ALLOWED_BY_SYSTEM })
  @Max(MAX_ASK_TIME, { context: ValidateError.LIMIT_INPUT_NOT_ALLOWED_BY_SYSTEM })
  @IsInt({ context: ValidateError.USER_ASK_MERCHANT_TIME_IS_INVALID })
  public userAskMerchantTime?: number;

  @IsOptional()
  @IsPositive({ context: ValidateError.USER_ASK_CS_TIME_IS_INVALID })
  @Min(MASTER_DATA_COMMON_MIN_VALUE.USER_ASK_CS_TIME, { context: ValidateError.LIMIT_INPUT_NOT_ALLOWED_BY_SYSTEM })
  @Max(MAX_ASK_TIME, { context: ValidateError.LIMIT_INPUT_NOT_ALLOWED_BY_SYSTEM })
  @IsInt({ context: ValidateError.USER_ASK_CS_TIME_IS_INVALID })
  public userAskCSTime?: number;

  @IsOptional()
  @IsIn(TIME_SELL, { context: ValidateError.MERCHANT_TO_USER_TIME_SELL_INVALID })
  @IsInt({ context: ValidateError.MERCHANT_TO_USER_TIME_SELL_INVALID })
  public merchantToUserTimeSell?: number;

  @IsOptional()
  @IsIn(TIME_BUY, { context: ValidateError.MERCHANT_TO_USER_TIME_BUY_INVALID })
  @IsInt({ context: ValidateError.MERCHANT_TO_USER_TIME_BUY_INVALID })
  public merchantToUserTimeBuy?: number;

  @IsOptional()
  @Min(MASTER_DATA_COMMON_MIN_VALUE.FEE, { context: ValidateError.LIMIT_INPUT_NOT_ALLOWED_BY_SYSTEM })
  @IsNumber({}, { context: ValidateError.FEE_INVALID })
  @MaxFee({ context: ValidateError.LIMIT_INPUT_NOT_ALLOWED_BY_SYSTEM })
  public fee?: number;

  @IsOptional()
  @Min(MASTER_DATA_COMMON_MIN_VALUE.PENALTY_FEE, { context: ValidateError.LIMIT_INPUT_NOT_ALLOWED_BY_SYSTEM })
  @IsNumber({}, { context: ValidateError.PENALTY_FEE_INVALID })
  @MaxFee({ context: ValidateError.LIMIT_INPUT_NOT_ALLOWED_BY_SYSTEM })
  public penaltyFee?: number;

  @IsOptional()
  @Min(MASTER_DATA_COMMON_MIN_VALUE.SETTING_LIMIT, { context: ValidateError.LIMIT_INPUT_NOT_ALLOWED_BY_SYSTEM })
  @IsNumber({}, { context: ValidateError.PAYMENT_METHOD_LIMIT_IS_INVALID })
  @Max(MAX_PAYMENT_METHOD_LIMIT, { context: ValidateError.LIMIT_INPUT_NOT_ALLOWED_BY_SYSTEM })
  @JSONSchema({ type: 'number', example: MASTER_DATA_COMMON_DEFAULT.NUMBER_LIMIT_PAYMENT_METHOD })
  @IsInt({ context: ValidateError.PAYMENT_METHOD_LIMIT_IS_INVALID })
  public userPaymentMethodsLimit?: number;

  @IsOptional()
  @Min(MASTER_DATA_COMMON_MIN_VALUE.SETTING_LIMIT, { context: ValidateError.LIMIT_INPUT_NOT_ALLOWED_BY_SYSTEM })
  @IsNumber({}, { context: ValidateError.PAYMENT_METHOD_LIMIT_IS_INVALID })
  @Max(MAX_PAYMENT_METHOD_LIMIT, { context: ValidateError.LIMIT_INPUT_NOT_ALLOWED_BY_SYSTEM })
  @JSONSchema({ type: 'number', example: MASTER_DATA_COMMON_DEFAULT.NUMBER_LIMIT_PAYMENT_METHOD })
  @IsInt({ context: ValidateError.PAYMENT_METHOD_LIMIT_IS_INVALID })
  public managerPaymentMethodsLimit?: number;

  @IsOptional()
  @Min(MASTER_DATA_COMMON_MIN_VALUE.SETTING_LIMIT, { context: ValidateError.LIMIT_INPUT_NOT_ALLOWED_BY_SYSTEM })
  @IsNumber({}, { context: ValidateError.ORDER_RECEIVING_LIMIT_IS_INVALID })
  @Max(MAX_APPEAL_RECEIVE_LIMIT, { context: ValidateError.LIMIT_INPUT_NOT_ALLOWED_BY_SYSTEM })
  @JSONSchema({ type: 'number', example: MASTER_DATA_COMMON_DEFAULT.NUMBER_LIMIT_PICK_APPEAL })
  @IsInt({ context: ValidateError.ORDER_RECEIVING_LIMIT_IS_INVALID })
  public appealReceivedBySupporterLimit?: number;

  @IsOptional()
  @Min(MASTER_DATA_COMMON_MIN_VALUE.SETTING_LIMIT, { context: ValidateError.LIMIT_INPUT_NOT_ALLOWED_BY_SYSTEM })
  @IsNumber({}, { context: ValidateError.APPEAL_RECEIVING_LIMIT_IS_INVALID })
  @Max(MAX_APPEAL_RECEIVE_LIMIT, { context: ValidateError.LIMIT_INPUT_NOT_ALLOWED_BY_SYSTEM })
  @JSONSchema({ type: 'number', example: MASTER_DATA_COMMON_DEFAULT.NUMBER_LIMIT_PICK_APPEAL })
  @IsInt({ context: ValidateError.APPEAL_RECEIVING_LIMIT_IS_INVALID })
  public appealReceivedByAdminSupporterLimit?: number;

  @IsOptional()
  @Min(MASTER_DATA_COMMON_MIN_VALUE.SETTING_LIMIT, { context: ValidateError.LIMIT_INPUT_NOT_ALLOWED_BY_SYSTEM })
  @IsNumber({}, { context: ValidateError.SUPPORT_REQUESTS_RECEIVING_LIMIT_IS_INVALID })
  @Max(MAX_SUPPORT_REQUEST_LIMIT, { context: ValidateError.LIMIT_INPUT_NOT_ALLOWED_BY_SYSTEM })
  @JSONSchema({ type: 'number', example: MASTER_DATA_COMMON_DEFAULT.NUMBER_LIMIT_PICK_REQUEST })
  @IsInt({ context: ValidateError.SUPPORT_REQUESTS_RECEIVING_LIMIT_IS_INVALID })
  public supportRequestsReceivingLimit?: number;

  @IsOptional()
  @Min(MASTER_DATA_COMMON_MIN_VALUE.EVIDENCE_TIME, { context: ValidateError.LIMIT_INPUT_NOT_ALLOWED_BY_SYSTEM })
  @IsNumber({}, { context: ValidateError.EVIDENCE_PROVISION_TIME_IS_INVALID })
  @Max(MAX_EVIDENCE_TIME_LIMIT, { context: ValidateError.LIMIT_INPUT_NOT_ALLOWED_BY_SYSTEM })
  @JSONSchema({ type: 'number', example: MASTER_DATA_COMMON_DEFAULT.APPEAL_EVIDENCE_TIME })
  @IsInt({ context: ValidateError.EVIDENCE_PROVISION_TIME_IS_INVALID })
  public evidenceProvisionTimeLimit?: number;

  @IsOptional()
  @Min(MASTER_DATA_COMMON_MIN_VALUE.SETTING_LIMIT, { context: ValidateError.LIMIT_INPUT_NOT_ALLOWED_BY_SYSTEM })
  @IsNumber({}, { context: ValidateError.CRYPTO_SENDING_WAIT_TIME_IS_INVALID })
  @Max(MAX_CRYPTO_TRANSACTION_TIME_LIMIT, { context: ValidateError.LIMIT_INPUT_NOT_ALLOWED_BY_SYSTEM })
  @JSONSchema({ type: 'number', example: MASTER_DATA_COMMON_DEFAULT.CRYPTO_TRANSACTION_TIME })
  @IsInt({ context: ValidateError.CRYPTO_SENDING_WAIT_TIME_IS_INVALID })
  public cryptoSendingWaitTimeLimit?: number;

  @IsOptional()
  @JSONSchema({ type: 'object', example: {} })
  public metadata: any;
}
