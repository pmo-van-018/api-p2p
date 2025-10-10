import { IsNumber, IsOptional, Max, Min } from 'class-validator';
import { MAX_PAGINATION_LIMIT, DEFAULT_PAGINATION_PAGE, MIN_PAGINATION_LIMIT } from '@api/common/models/P2PConstant';
import { ValidateError } from '@api/common/errors/ValidateError';

export class PaginationQueryRequest {
  @IsNumber({}, { context: ValidateError.LIMIT_INVALID })
  @IsOptional()
  @Min(MIN_PAGINATION_LIMIT, { context: ValidateError.LIMIT_INVALID })
  @Max(MAX_PAGINATION_LIMIT, { context: ValidateError.LIMIT_INVALID })
  public limit = MAX_PAGINATION_LIMIT;

  @IsNumber({}, { context: ValidateError.PAGE_INVALID })
  @IsOptional()
  @Min(DEFAULT_PAGINATION_PAGE, { context: ValidateError.PAGE_INVALID })
  public page = DEFAULT_PAGINATION_PAGE;
}
