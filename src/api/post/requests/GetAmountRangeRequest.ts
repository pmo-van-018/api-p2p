import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { TradeType } from '@api/common/models/P2PEnum';
import { MAX_STRING_LENGTH_COMMON } from '@api/common/constants/RequestFieldConstant';
import { ValidateError } from '@api/post/errors/ValidateError';

export class GetAmountRangeRequest {
  @IsNotEmpty({ context: ValidateError.ASSET_NAME_REQUIRED })
  @IsString({ context: ValidateError.ASSET_NAME_INVALID })
  @MaxLength(MAX_STRING_LENGTH_COMMON, { context: ValidateError.ASSET_NAME_INVALID })
  public assetName: string;

  @IsNotEmpty({ context: ValidateError.NETWORK_REQUIRED })
  @IsString({ context: ValidateError.NETWORK_INVALID })
  @MaxLength(MAX_STRING_LENGTH_COMMON, { context: ValidateError.NETWORK_INVALID })
  public assetNetwork: string;

  @IsNotEmpty({ context: ValidateError.FIAT_REQUIRED })
  @IsString({ context: ValidateError.FIAT_INVALID })
  @MaxLength(MAX_STRING_LENGTH_COMMON, { context: ValidateError.FIAT_INVALID })
  public fiat: string;

  @IsNotEmpty({ context: ValidateError.POST_TYPE_REQUIRED })
  @IsEnum(TradeType, { context: ValidateError.POST_TYPE_INVALID })
  public type: TradeType;
}
