import { IsEnum, IsOptional } from 'class-validator';
import { TradeType } from '@api/common/models/P2PEnum';
import { IsBeforeDate } from '@api/common/validations/IsBeforeDate';
import { IsOnlyDate } from '@api/common/validations/IsOnlyDate';
import { PaginationQueryRequest } from '@api/common/requests/PaginationQueryRequest';
import { ValidateError } from '@api/order/errors/ValidateError';
import { ValidateError as CommonValidateError } from '@api/common/errors/ValidateError';
import { IsSortProperty } from '@api/common/validations/IsSortProperty';

export class UserGetListOrderRequest extends PaginationQueryRequest {
  @IsOptional()
  @IsEnum(TradeType, {
    each: true,
    context: ValidateError.TYPE_IS_INVALID,
  })
  public type?: TradeType;

  @IsOptional()
  public status: string;

  @IsOptional()
  public assetId: string;

  @IsOptional()
  public searchField: 'refId' | 'transCode' | 'totalPrice' = 'refId';

  @IsOptional()
  public searchValue: string;

  @IsOptional()
  public orderField: 'amount' | 'updatedAt' | 'id' | 'endedTime' = 'updatedAt';

  @IsOptional()
  public orderDirection: 'ASC' | 'DESC';

  @IsOptional()
  @IsOnlyDate({
    context: CommonValidateError.DATE_IS_INVALID,
  })
  @IsBeforeDate('endDate', {
    message: '',
    context: CommonValidateError.DATE_RANGE_IS_INVALID,
  })
  public startDate: string;

  @IsOptional()
  @IsOnlyDate({
    context: CommonValidateError.DATE_IS_INVALID,
  })
  public endDate: string;

  @IsSortProperty(['totalPrice', 'createdAt'])
  public sort: string = 'createdAt:ASC';
}
