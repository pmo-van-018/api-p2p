import { SearchType } from '@api/common/models/P2PEnum';
import { PaginationQueryRequest } from '@api/common/requests/PaginationQueryRequest';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { ValidateError } from '@api/common/errors/ValidateError';

export class GetListUsersByAdminParamsRequest extends PaginationQueryRequest {
  @IsOptional()
  @IsString()
  @JSONSchema({ type: 'string', example: '1' })
  public searchValue: string;

  @IsOptional()
  @IsString({
    context: ValidateError.DATE_IS_INVALID,
  })
  public startDate: string;

  @IsOptional()
  @IsString({
    context: ValidateError.DATE_IS_INVALID,
  })
  public endDate: string;

  @IsOptional()
  public fieldDate: 'lastTradeAt' | 'lastLoginAt' | 'createdAt' = 'createdAt';

  @IsOptional()
  @IsEnum(SearchType, { each: true })
  @JSONSchema({ type: 'string', example: '1' })
  public searchType: SearchType;

  @IsOptional()
  public orderField: 'lastTradeAt' | 'lastLoginAt' | 'createdAt' = 'lastLoginAt';

  @IsOptional()
  public orderDirection: 'ASC' | 'DESC' = 'DESC';
}
