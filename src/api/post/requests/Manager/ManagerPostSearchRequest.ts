import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PostStatus, TradeType } from '@api/common/models/P2PEnum';
import { PaginationQueryRequest } from '@api/common/requests/PaginationQueryRequest';
import { ValidateError } from '@api/post/errors/ValidateError';
import { IsStringArray } from '@api/common/validations/IsStringArray';

export class ManagerPostSearchRequest extends PaginationQueryRequest {

  @IsOptional()
  @IsEnum(TradeType, { context: ValidateError.POST_TYPE_INVALID })
  public type: TradeType;

  @IsOptional()
  public searchType: 'WALLET_ADDRESS' | 'NICK_NAME' | 'POST_REFID';

  @IsOptional()
  public search: string;

  @IsOptional()
  public orderField: 'availableAmount' | 'finishedAmount' | 'price' | 'status' | 'createdAt' = 'createdAt';

  @IsOptional()
  public orderDirection: 'ASC' | 'DESC';

  @IsOptional()
  @IsStringArray([PostStatus.ONLINE, PostStatus.OFFLINE, PostStatus.CLOSE], { context: ValidateError.STATUS_INVALID })
  public status: string;

  @IsOptional()
  @IsUUID(4, { context: ValidateError.ASSET_ID_INVALID })
  public assetId?: string;
}
