import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OperationStatus, SearchType } from '@api/common/models/P2PEnum';
import { PaginationQueryRequest } from '@api/common/requests/PaginationQueryRequest';
import { IsBeforeDate } from '@api/common/validations/IsBeforeDate';
import { IsOnlyDate } from '@api/common/validations/IsOnlyDate';
import { IsStringArray } from '@api/common/validations/IsStringArray';
import { ValidateError } from '@api/common/errors/ValidateError';

export abstract class FindAdminSupporterRequest extends PaginationQueryRequest {
  @IsOptional()
  @IsOnlyDate({
    context: ValidateError.DATE_IS_INVALID,
  })
  @IsBeforeDate('endDate', {
    message: '',
    context: ValidateError.DATE_RANGE_IS_INVALID,
  })
  public startDate?: string;

  @IsOptional()
  @IsOnlyDate({
    context: ValidateError.DATE_IS_INVALID,
  })
  public endDate?: string;

  @IsOptional()
  @IsEnum(SearchType, { each: true })
  public searchField: SearchType;

  @IsOptional()
  @IsString()
  public searchValue?: string;

  @IsOptional()
  @IsStringArray([OperationStatus.ACTIVE, OperationStatus.INACTIVE])
  public status?: string;
}
