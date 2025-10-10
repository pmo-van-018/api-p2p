import { IsEnum, IsNotEmpty, IsOptional, IsPositive, IsString, IsUUID, MaxLength, ValidateIf } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

import { PostStatus, TradeType } from '@api/common/models/P2PEnum';
import { IsGreaterThan } from '@api/common/validations/IsGreaterThan';
import { MaxCrypto, MaxFiat } from '@api/common/validations/Max';
import { CREATE_POST_TYPE } from '@api/common/validations/ValidationType';
import { SanitizeString } from '@api/common/validations/SanitizeString';

export class PostUpdateRequest {
  @IsNotEmpty({
    context: {
      key: CREATE_POST_TYPE.POST_ID_IS_INVALID,
    },
  })
  @IsString({
    context: {
      key: CREATE_POST_TYPE.POST_ID_IS_INVALID,
    },
  })
  @IsUUID(4, {
    context: {
      key: CREATE_POST_TYPE.POST_ID_IS_INVALID,
    },
  })
  public postId: string;

  /**
    * *********************************
   */

  @ValidateIf((post) => post.postType === TradeType.SELL)
  @IsString({
    context: {
      key: CREATE_POST_TYPE.PAYMENT_METHOD_IS_INVALID,
    },
  })
  @IsUUID(4, {
    context: {
      key: CREATE_POST_TYPE.PAYMENT_METHOD_IS_INVALID,
    },
  })
  public paymentMethodId?: string;

  /**
    * *********************************
   */

  @IsOptional()
  @JSONSchema({ type: 'number', example: 10 })
  @IsPositive({
    context: {
      key: CREATE_POST_TYPE.FIAT_TYPE_IS_INVALID,
    },
  })
  public userToMerchantTime: number;

  /**
    * *********************************
   */

  @IsOptional()
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

  @IsOptional()
  @MaxCrypto()
  public availableAmount: number;

  /**
    * *********************************
   */

  @IsOptional()
  @IsPositive({
    context: {
      key: CREATE_POST_TYPE.LOWER_FIAT_LIMIT_IS_INVALID,
    },
  })
  @MaxFiat()
  @JSONSchema({ type: 'number', example: 10 })
  public lowerFiatLimit: number;

  /**
    * *********************************
   */

  @IsOptional()
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

  @IsOptional()
  @IsEnum(PostStatus, { each: true })
  @JSONSchema({ type: 'string', example: 1 })
  public showAd: number;

  /**
    * *********************************
   */

  @IsOptional()
  @MaxLength(300, {
    context: {
      key: CREATE_POST_TYPE.MERCHANT_NOTE_IS_MAX_LENGTH,
    },
  })
  @SanitizeString()
  public merchantNote?: string;
}
