import { IsOptional, IsString } from 'class-validator';
import { OperationType, UserStatus } from '@api/common/models/P2PEnum';
import { PaginationQueryRequest } from '@api/common/requests/PaginationQueryRequest';
import { IsStringArray } from '@api/common/validations/IsStringArray';
import { ValidateError } from '@api/profile/errors/ValidateError';
import { ValidateError as CommonValidateError } from '@api/common/errors/ValidateError';
import { IsOnlyDate } from '@api/common/validations/IsOnlyDate';
import { IsBeforeDate } from '@api/common/validations/IsBeforeDate';

export class GetMerchantStaffRequest extends PaginationQueryRequest {
  @IsOptional()
  @IsStringArray([UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.DELETED], { context: ValidateError.STAFF_STATUS_INVALID })
  public status?: string;

  @IsOptional()
  @IsStringArray([OperationType.MERCHANT_OPERATOR, OperationType.MERCHANT_SUPPORTER])
  public type?: string;

  @IsOptional()
  @IsOnlyDate({ context: CommonValidateError.DATE_IS_INVALID })
  @IsBeforeDate('endDate', { context: CommonValidateError.DATE_RANGE_IS_INVALID })
  public startDate?: string;

  @IsOptional()
  @IsOnlyDate({ context: CommonValidateError.DATE_IS_INVALID })
  public endDate?: string;

  @IsOptional()
  @IsString()
  public search?: string;
}
