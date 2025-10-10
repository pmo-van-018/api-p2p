import { IsEnum, IsIn, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';
import { TradeType } from '@api/common/models/P2PEnum';
import { PaginationQueryRequest } from '@api/common/requests/PaginationQueryRequest';
import { MAX_STRING_LENGTH_COMMON } from '@api/common/constants/RequestFieldConstant';
import { MaxFiat } from '@api/common/validations/Max';
import { ValidateError } from '@api/post/errors/ValidateError';

export class GetPostRequest extends PaginationQueryRequest {
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

  @IsOptional()
  @IsPositive({ context: ValidateError.AMOUNT_POSITIVE })
  @MaxFiat({ context: ValidateError.AMOUNT_VALUE_EXCEED })
  public amount?: number;

  @IsOptional()
  @IsPositive({ context: ValidateError.MIN_AMOUNT_POSITIVE })
  @MaxFiat({ context: ValidateError.AMOUNT_VALUE_EXCEED })
  public minAmount?: number;

  @IsOptional()
  @IsPositive({ context: ValidateError.MAX_AMOUNT_POSITIVE })
  @MaxFiat({ context: ValidateError.AMOUNT_VALUE_EXCEED })
  public maxAmount?: number;

  @IsOptional()
  @IsIn(['ASC', 'DESC'], { context: ValidateError.SORT_DIRECTION_INVALID })
  public sortDirection?: string;
}
