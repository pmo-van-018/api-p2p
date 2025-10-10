import { IsEnum, IsIn, IsOptional, IsUUID, MaxLength } from 'class-validator';

import { TradeType } from '@api/common/models/P2PEnum';
import { PaginationQueryRequest } from '@api/common/requests/PaginationQueryRequest';
import { MAX_STRING_LENGTH_COMMON } from '@api/common/constants/RequestFieldConstant';
import { ValidateError } from '@api/appeal/errors/ValidateError';

export class GetAppealListRequest extends PaginationQueryRequest {
  @IsOptional()
  @IsEnum(TradeType, { context: ValidateError.ORDER_TYPE_INVALID })
  public orderType?: TradeType;

  @IsOptional()
  @IsUUID(4, { context: ValidateError.APPEAL_ID_INVALID })
  public assetId?: string;

  @IsOptional()
  @IsUUID(4, { context: ValidateError.SUPPORTER_ID_INVALID })
  public supporterId?: string;

  @IsOptional()
  @MaxLength(MAX_STRING_LENGTH_COMMON, { context: ValidateError.ORDER_STATUS_INVALID })
  public orderStatus?: string;

  @IsOptional()
  @MaxLength(MAX_STRING_LENGTH_COMMON, { context: ValidateError.APPEAL_STATUS_INVALID })
  public appealStatus?: string;

  @IsOptional()
  @IsIn(['orderId', 'totalPrice'], { context: ValidateError.SEARCH_FIELD_INVALID })
  public searchField?: string;

  @IsOptional()
  @MaxLength(MAX_STRING_LENGTH_COMMON, { context: ValidateError.SEARCH_VALUE_INVALID })
  public searchValue?: string;

  @IsOptional()
  @IsIn(['amount', 'createdAt', 'updatedAt'], { context: ValidateError.SORT_FIELD_INVALID })
  public sortField?: string;

  @IsOptional()
  @IsIn(['ASC', 'DESC'], { context: ValidateError.SORT_DIRECTION_INVALID })
  public sortDirection?: string;
}
