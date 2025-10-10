import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { OperationStatus, OperationType } from '@api/common/models/P2PEnum';
import { PaginationQueryRequest } from '@api/common/requests/PaginationQueryRequest';
import { IsBeforeDate } from '@api/common/validations/IsBeforeDate';
import { IsOnlyDate } from '@api/common/validations/IsOnlyDate';
import { IsStringArray } from '@api/common/validations/IsStringArray';
import { ValidateError } from '@api/common/errors/ValidateError';

export abstract class FindAllMerchantsQueryRequest extends PaginationQueryRequest {

  @IsOptional()
  @IsOnlyDate({
    context: ValidateError.DATE_IS_INVALID,
  })
  @IsBeforeDate('endDate', {
    context: ValidateError.DATE_RANGE_IS_INVALID,
  })
  public startDate?: string;

  @IsOptional()
  @IsOnlyDate({
    context: ValidateError.DATE_IS_INVALID,
  })
  public endDate?: string;

  @IsOptional()
  @IsString()
  public search?: string;

  public abstract status?: string;

  @IsOptional()
  @IsBoolean()
  public isGetAll?: boolean;

  @IsOptional()
  @IsStringArray([OperationType.MERCHANT_OPERATOR, OperationType.MERCHANT_SUPPORTER])
  public type?: string;
}

export class FindAllMerchantsInWhitelistQueryRequest extends FindAllMerchantsQueryRequest {
  @IsOptional()
  @IsStringArray([OperationStatus.ACTIVE, OperationStatus.INACTIVE])
  public status?: string;
}
