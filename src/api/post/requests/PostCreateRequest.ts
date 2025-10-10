import { IsEnum, IsNotEmpty, IsOptional, IsPositive, IsString, IsUUID, MaxLength, ValidateIf } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { PostStatus, TradeType } from '@api/common/models/P2PEnum';
import { IsGreaterThan } from '@api/common/validations/IsGreaterThan';
import { MaxCrypto, MaxFiat } from '@api/common/validations/Max';
import { CREATE_POST_TYPE } from '@api/common/validations/ValidationType';
import { SanitizeString } from '@api/common/validations/SanitizeString';

export class PostCreateRequest {
  @IsNotEmpty({
    context: {
      key: CREATE_POST_TYPE.POST_TYPE_IS_INVALID,
    },
  })
  @IsEnum(TradeType, {
    each: true,
    context: {
      key: CREATE_POST_TYPE.POST_TYPE_IS_INVALID,
    },
  })
  public postType: TradeType;

  /**
    * *********************************
   */

  @IsNotEmpty({
    context: {
      key: CREATE_POST_TYPE.ASSET_ID_IS_INVALID,
    },
  })
  @IsUUID(4, {
    context: {
      key: CREATE_POST_TYPE.ASSET_ID_IS_INVALID,
    },
  })
  public assetId: string;

  /**
    * *********************************
   */

  @IsNotEmpty({
    context: {
      key: CREATE_POST_TYPE.FIAT_TYPE_IS_INVALID,
    },
  })
  @IsUUID(4, {
    context: {
      key: CREATE_POST_TYPE.FIAT_TYPE_IS_INVALID,
    },
  })
  public fiatId: string;

  /**
    * *********************************
   */

  @ValidateIf((post) => post.postType === TradeType.SELL)
  @IsString({
    context: {
      key: CREATE_POST_TYPE.PAYMENT_METHOD_IS_INVALID,
    },
  })
  public paymentMethodId?: string;

  /**
    * *********************************
   */

  @IsNotEmpty({
    context: {
      key: CREATE_POST_TYPE.USER_TO_MERCHANT_TIME_IS_EMPTY,
    },
  })
  @JSONSchema({ type: 'number', example: 10 })
  @IsPositive({
    context: {
      key: CREATE_POST_TYPE.USER_TO_MERCHANT_TIME_IS_INVALID,
    },
  })
  public userToMerchantTime: number;

  /**
    * *********************************
   */

  @IsNotEmpty({
    context: {
      key: CREATE_POST_TYPE.FIXED_PRICE_BEFORE_FEE_IS_EMPTY,
    },
  })
  @IsPositive({
    context: {
      key: CREATE_POST_TYPE.FIXED_PRICE_BEFORE_FEE_IS_INVALID,
    },
  })
  @MaxFiat()
  public fixedPriceBeforeFee: number;

  /**
    * *********************************
   */

  @IsNotEmpty({
    context: {
      key: CREATE_POST_TYPE.CRYPTO_AMOUNT_IS_EMPTY,
    },
  })
  @JSONSchema({ type: 'number', example: 10000 })
  @MaxCrypto()
  public availableAmount: number;

  /**
    * *********************************
   */

  @IsNotEmpty({
    context: {
      key: CREATE_POST_TYPE.LOWER_FIAT_LIMIT_IS_INVALID,
    },
  })
  @IsPositive({
    context: {
      key: CREATE_POST_TYPE.LOWER_FIAT_LIMIT_IS_INVALID,
    },
  })
  @JSONSchema({ type: 'number', example: 10 })
  @MaxFiat()
  public lowerFiatLimit: number;

  /**
    * *********************************
   */

  @IsNotEmpty({
    context: {
      key: CREATE_POST_TYPE.UPPER_FIAT_LIMIT_IS_EMPTY,
    },
  })
  @IsPositive({
    context: {
      key: CREATE_POST_TYPE.UPPER_FIAT_LIMIT_IS_INVALID,
    },
  })
  @IsGreaterThan('lowerFiatLimit', {
    message: 'upperFiatLimit must be greater than the lowerFiatLimit',
    context: {
      key: CREATE_POST_TYPE.UPPER_FIAT_LIMIT_IS_SMALLER_THAN_LOWER_ORDER_LIMIT,
    },
  })
  @JSONSchema({ type: 'number', example: 1000000 })
  @MaxFiat()
  public upperFiatLimit: number;

  /**
    * *********************************
   */

  @IsEnum(PostStatus, { each: true })
  @JSONSchema({ type: 'string', example: 1 })
  public showAd = PostStatus.ONLINE;

  /**
    * *********************************
   */

  @IsOptional()
  @JSONSchema({ type: 'string', example: 'note' })
  @MaxLength(300, {
    context: {
      key: CREATE_POST_TYPE.MERCHANT_NOTE_IS_MAX_LENGTH,
    },
  })
  @SanitizeString()
  public merchantNote?: string;
}
