import { IsEnum, IsNotEmpty, IsPositive, IsString, MaxLength } from 'class-validator';
import { TradeType } from '@api/common/models/P2PEnum';
import { MAX_STRING_LENGTH_COMMON } from '@api/common/constants/RequestFieldConstant';
import { MaxFiat } from '@api/common/validations/Max';
import { ValidateError } from '@api/post/errors/ValidateError';

export class GetReferenceExchangeRateRequest {
  @IsNotEmpty({ context: ValidateError.ASSET_NAME_REQUIRED })
  @IsString({ context: ValidateError.ASSET_NAME_INVALID })
  @MaxLength(MAX_STRING_LENGTH_COMMON, { context: ValidateError.ASSET_NAME_INVALID })
  public assetName: string;

  @IsNotEmpty({ context: ValidateError.POST_TYPE_REQUIRED })
  @IsEnum(TradeType, { context: ValidateError.POST_TYPE_INVALID })
  public postType: TradeType;

  @IsNotEmpty({ context: ValidateError.LOWER_FIAT_LIMIT_REQUIRED })
  @IsPositive({ context: ValidateError.LOWER_FIAT_LIMIT_INVALID })
  @MaxFiat({ context: ValidateError.LOWER_FIAT_LIMIT_INVALID })
  public lowerFiatLimit: number;
}
