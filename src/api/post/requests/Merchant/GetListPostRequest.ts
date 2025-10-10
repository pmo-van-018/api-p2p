import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import {PostStatus, TradeType} from '@api/common/models/P2PEnum';
import { PaginationQueryRequest } from '@api/common/requests/PaginationQueryRequest';
import { IsStringArray } from '@api/common/validations/IsStringArray';
import { ValidateError } from '@api/post/errors/ValidateError';

export class GetListPostRequest extends PaginationQueryRequest {
  @IsOptional()
  @IsEnum(TradeType, { context: ValidateError.POST_TYPE_INVALID })
  public type: TradeType;

  @IsNotEmpty()
  @IsStringArray([PostStatus.ONLINE, PostStatus.OFFLINE, PostStatus.CLOSE], { context: ValidateError.STATUS_INVALID })
  public status: string;

  @IsOptional()
  @IsUUID(4, { context: ValidateError.ASSET_ID_INVALID })
  public assetId?: string;

  @IsOptional()
  public orderField: 'amount' | 'id' | 'status' | 'createdAt' = 'createdAt';

  @IsOptional()
  public orderDirection: 'ASC' | 'DESC';
}
