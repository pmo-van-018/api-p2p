import { BLACKLIST_INSERTED_TYPE } from '@api/blacklist/models/BlacklistEntity';
import { IsEnum, IsOptional, MaxLength } from 'class-validator';
import { PaginationQueryRequest } from '@api/common/requests/PaginationQueryRequest';
import { MAX_STRING_LENGTH } from '@api/common/models/P2PConstant';
import { ValidateError } from '@api/blacklist/errors/ValidateError';

export class GetBlacklistRequest extends PaginationQueryRequest {
  @IsOptional()
  @MaxLength(MAX_STRING_LENGTH, { context: ValidateError.SEARCH_VALUE_INVALID })
  public search?: string;

  @IsOptional()
  @IsEnum(BLACKLIST_INSERTED_TYPE, { context: ValidateError.TYPE_INVALID })
  public type?: BLACKLIST_INSERTED_TYPE;

  @IsOptional()
  public orderField?: 'createdAt';

  @IsOptional()
  public orderDirection?: 'ASC' | 'DESC';
}
