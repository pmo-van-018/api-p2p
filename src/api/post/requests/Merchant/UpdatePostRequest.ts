import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Length, Matches,
  Max,
  MaxLength
} from 'class-validator';
import { PostStatus } from '@api/common/models/P2PEnum';
import { IsGreaterThan } from '@api/common/validations/IsGreaterThan';
import { MaxCrypto, MaxFiat } from '@api/common/validations/Max';
import { SanitizeString } from '@api/common/validations/SanitizeString';
import { ValidateError } from '@api/post/errors/ValidateError';
import { MAX_PERCENT } from '@api/common/models/P2PConstant';

export class UpdatePostRequest {
  @IsNotEmpty({ context: ValidateError.POST_ID_REQUIRED })
  @IsString({ context: ValidateError.POST_ID_INVALID })
  @Length(20, 20, { context: ValidateError.POST_ID_INVALID })
  @Matches(/^[0-9]*$/, { context: ValidateError.POST_ID_INVALID })
  public id: string;

  @IsOptional()
  @IsString({ context: ValidateError.PAYMENT_METHOD_ID_INVALID })
  @IsUUID(4, { context: ValidateError.PAYMENT_METHOD_ID_INVALID })
  public paymentMethodId?: string;

  @IsOptional()
  @IsPositive({ context: ValidateError.TIME_INVALID })
  public userToMerchantTime: number;

  @IsOptional()
  @IsPositive({ context: ValidateError.AMOUNT_INVALID })
  @MaxFiat({ context: ValidateError.AMOUNT_TOO_LARGE })
  public price: number;

  @IsOptional()
  @MaxCrypto({ context: ValidateError.AMOUNT_TOO_LARGE })
  public availableAmount: number;

  @IsOptional()
  @IsPositive({ context: ValidateError.AMOUNT_INVALID })
  @MaxFiat({ context: ValidateError.AMOUNT_TOO_LARGE })
  public lowerFiatLimit: number;

  @IsOptional()
  @IsPositive({ context: ValidateError.AMOUNT_INVALID })
  @IsGreaterThan('lowerFiatLimit', { context: ValidateError.AMOUNT_INVALID })
  @MaxFiat({ context: ValidateError.AMOUNT_TOO_LARGE })
  public upperFiatLimit: number;

  @IsOptional()
  @IsEnum(PostStatus, { each: true, context: ValidateError.STATUS_INVALID })
  public showAd: number;

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
