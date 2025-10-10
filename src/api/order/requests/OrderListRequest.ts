import { IsBoolean, IsEnum, IsIn, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

import { TradeType } from '@api/common/models/P2PEnum';
import { IsBeforeDate } from '@api/common/validations/IsBeforeDate';
import { IsOnlyDate } from '@api/common/validations/IsOnlyDate';
import { IsSortProperty } from '@api/common/validations/IsSortProperty';
import { LIST_PARAM_TYPE, ORDER_LIST_TYPE } from '@api/common/validations/ValidationType';
import { ORDER_GROUPS } from '@base/utils/orderStatistic';
import { JSONSchema } from 'class-validator-jsonschema';

export class OrderListRequest {
  @IsNotEmpty({
    context: {
      key: ORDER_LIST_TYPE.LIMIT_IS_INVALID,
    },
  })
  @IsPositive({
    context: {
      key: ORDER_LIST_TYPE.LIMIT_IS_INVALID,
    },
  })
  public limit: number;

  @IsNotEmpty({
    context: {
      key: ORDER_LIST_TYPE.PAGE_IS_INVALID,
    },
  })
  @IsPositive({
    context: {
      key: ORDER_LIST_TYPE.PAGE_IS_INVALID,
    },
  })
  public page: number;

  @IsOptional()
  @IsEnum(TradeType, {
    each: true,
    context: {
      key: ORDER_LIST_TYPE.TYPE_IS_INVALID,
    },
  })
  public type?: TradeType;

  @IsOptional()
  public orderStatus: string;

  @IsOptional()
  public appealStatus: string;

  @IsOptional()
  public search: string;
  /**
   * *********************************
   */

  @IsOptional()
  public searchField: 'refId' | 'transCode' | 'totalPrice' = 'refId';

  /**
   * *********************************
   */
  @IsOptional()
  public searchValue: string;

  @IsOptional()
  public orderField: 'amount' | 'updatedAt' | 'id' | 'endedTime' = 'updatedAt';

  @IsOptional()
  public orderDirection: 'ASC' | 'DESC';

  @IsOptional()
  @IsOnlyDate({
    context: {
      key: LIST_PARAM_TYPE.DATE_IS_INVALID,
    },
  })
  @IsBeforeDate('endDate', {
    message: '',
    context: {
      key: LIST_PARAM_TYPE.DATE_RANGE_IS_INVALID,
    },
  })
  public startDate: string;

  @IsOptional()
  @IsOnlyDate({
    context: {
      key: LIST_PARAM_TYPE.DATE_IS_INVALID,
    },
  })
  public endDate: string;

  @IsOptional()
  @IsString()
  @IsIn(ORDER_GROUPS, {
    each: true,
    context: {
      key: ORDER_LIST_TYPE.TYPE_IS_INVALID,
    },
  })
  public orderGroup?: string;

  @IsSortProperty(['amount', 'updatedAt', 'id', 'endedTime', 'status', 'step', 'createdAt', 'totalPrice'])
  @JSONSchema({ type: 'string', example: 'updatedAt:ASC' })
  public sort: string = 'updatedAt:ASC';

  @IsOptional()
  @IsBoolean()
  public readonly?: boolean;
}
