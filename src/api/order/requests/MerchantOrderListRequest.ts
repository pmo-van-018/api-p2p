import {
  IsOptional,
  IsEnum,
  IsString,
  IsIn,
  IsUUID, IsBoolean,
} from 'class-validator';

import { IsBeforeDate } from '@api/common/validations/IsBeforeDate';
import { IsOnlyDate } from '@api/common/validations/IsOnlyDate';
import { TradeType } from '@api/common/models/P2PEnum';
import { IsSortProperty } from '@api/common/validations/IsSortProperty';
import { JSONSchema } from 'class-validator-jsonschema';
import { ORDER_GROUPS } from '@base/utils/orderStatistic';
import { PaginationQueryRequest } from '@api/common/requests/PaginationQueryRequest';
import { ValidateError } from '@api/order/errors/ValidateError';
import { ValidateError as CommonValidateError } from '@api/common/errors/ValidateError';

export class MerchantOrderListRequest extends PaginationQueryRequest {
  @IsOptional()
  @IsEnum(TradeType, {
    each: true,
    context: ValidateError.TYPE_IS_INVALID,
  })
  public type?: TradeType;

  @IsString()
  @IsOptional()
  public orderStatus: string;

  @IsString()
  @IsOptional()
  public assetType: string;

  @IsOptional()
  public searchField: 'refId' | 'transCode' | 'totalPrice' = 'refId';

  @IsOptional()
  public searchValue: string;

  /**
   * @deprecated Use **sort** property instead.
   */
  @IsOptional()
  public orderField: 'amount' | 'updatedAt' | 'id' | 'endedTime';

  /**
   * @deprecated Use **sort** property instead.
   */
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

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @IsOptional()
  @IsSortProperty(['amount', 'createdAt', 'updatedAt', 'id', 'endedTime', 'status', 'step', 'totalPrice'])
  @JSONSchema({ type: 'string', example: 'updatedAt:ASC' })
  public sort: string;

  @IsString()
  @IsIn(ORDER_GROUPS, {
    each: true,
    context: ValidateError.TYPE_IS_INVALID,
  })
  public orderGroup?: string;

  @IsOptional()
  @IsUUID(4)
  public merchantId?: string;

  @IsOptional()
  @IsUUID(4)
  public supporterId?: string;

  @IsOptional()
  @IsBoolean()
  public readonly?: boolean;
}
