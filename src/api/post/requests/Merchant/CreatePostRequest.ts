import { IsEnum, IsNotEmpty, IsOptional, IsPositive, IsString, IsUUID, Max, MaxLength, ValidateIf } from 'class-validator';
import { PostStatus, TradeType } from '@api/common/models/P2PEnum';
import { IsGreaterThan } from '@api/common/validations/IsGreaterThan';
import { MaxCrypto, MaxFiat } from '@api/common/validations/Max';
import { SanitizeString } from '@api/common/validations/SanitizeString';
import { ValidateError } from '@api/post/errors/ValidateError';
import { MAX_PERCENT } from '@api/common/models/P2PConstant';

export class CreatePostRequest {
  @IsNotEmpty({ context: ValidateError.TYPE_REQUIRED })
  @IsEnum(TradeType, { each: true, context: ValidateError.TYPE_INVALID })
  public type: TradeType;

  @IsNotEmpty({ context: ValidateError.ASSET_ID_REQUIRED })
  @IsUUID(4, { context: ValidateError.ASSET_ID_INVALID })
  public assetId: string;

  @IsNotEmpty({ context: ValidateError.FIAT_ID_REQUIRED })
  @IsUUID(4, { context: ValidateError.FIAT_ID_INVALID })
  public fiatId: string;

  @ValidateIf((post) => post.postType === TradeType.SELL)
  @IsString({ context: ValidateError.PAYMENT_METHOD_ID_INVALID })
  public paymentMethodId?: string;

  @IsNotEmpty({ context: ValidateError.TIME_INVALID })
  @IsPositive({ context: ValidateError.TIME_INVALID })
  public userToMerchantTime: number;

  @IsNotEmpty({ context: ValidateError.AMOUNT_INVALID })
  @IsPositive({ context: ValidateError.AMOUNT_INVALID })
  @MaxFiat({ context: ValidateError.AMOUNT_TOO_LARGE })
  public price: number;

  @IsNotEmpty({ context: ValidateError.AMOUNT_INVALID })
  @MaxCrypto({ context: ValidateError.AMOUNT_TOO_LARGE })
  public availableAmount: number;

  @IsNotEmpty({ context: ValidateError.AMOUNT_INVALID })
  @IsPositive({ context: ValidateError.AMOUNT_INVALID })
  @MaxFiat({ context: ValidateError.AMOUNT_TOO_LARGE })
  public lowerFiatLimit: number;

  @IsNotEmpty({ context: ValidateError.AMOUNT_INVALID })
  @IsPositive({ context: ValidateError.AMOUNT_INVALID })
  @IsGreaterThan('lowerFiatLimit', { context: ValidateError.AMOUNT_INVALID })
  @MaxFiat({ context: ValidateError.AMOUNT_TOO_LARGE })
  public upperFiatLimit: number;

  @IsEnum(PostStatus, { each: true, context: ValidateError.STATUS_INVALID })
  public showAd = PostStatus.ONLINE;

  @IsOptional()
  @MaxLength(300, { context: ValidateError.NOTE_TOO_LONG })
  @SanitizeString({ context: ValidateError.NOTE_INVALID })
  public merchantNote?: string;

  @IsOptional()
  @IsPositive({ context: ValidateError.AMOUNT_INVALID })
  @MaxFiat({ context: ValidateError.AMOUNT_TOO_LARGE })
  public benchmarkPrice?: number;

  @IsOptional()
  @IsPositive({ context: ValidateError.PERCENT_INVALID })
  @Max(MAX_PERCENT, { context: ValidateError.PERCENT_TOO_LARGE })
  public benchmarkPercent?: number;
}
