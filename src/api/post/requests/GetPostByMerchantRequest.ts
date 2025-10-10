import { IsEnum, IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { PaginationQueryRequest } from '@api/common/requests/PaginationQueryRequest';
import { TradeType } from '@api/common/models';
import { ValidateError } from '@api/post/errors/ValidateError';

export class GetPostByMerchantRequest extends PaginationQueryRequest {
  @IsNotEmpty({ context: ValidateError.POST_TYPE_REQUIRED })
  @IsEnum(TradeType, { context: ValidateError.POST_TYPE_INVALID })
  public type: TradeType;

  @IsNotEmpty({ context: ValidateError.MERCHANT_ID_REQUIRED })
  @IsString({ context: ValidateError.MERCHANT_ID_INVALID })
  @Length(20, 20, { context: ValidateError.MERCHANT_ID_INVALID })
  @Matches(/^[0-9]*$/, { context: ValidateError.MERCHANT_ID_INVALID })
  public merchantId: string;
}
