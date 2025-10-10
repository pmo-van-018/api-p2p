import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { TradeType } from '@api/common/models/P2PEnum';
import { OrderError } from '@api/order/errors/OrderError';
import { IsAfterDate } from '@api/common/validations/IsAfterDate';
import { ValidateError } from '@api/order/errors/ValidateError';

export class GetOrderPriceStatisticByPeriodRequest {
  @IsNotEmpty({
    context: OrderError.ORDER_TYPE_IS_REQUIRED,
  })
  @IsEnum(TradeType, {
    each: true,
    context: ValidateError.TYPE_IS_INVALID,
  })
  public type: TradeType;

  @IsNotEmpty({
    context: OrderError.FILTER_BY_TIME_IS_REQUIRED,
  })
  @IsDateString({}, {
    context: OrderError.FILTER_BY_TIME_IS_INVALID,
  })
  public from: string;

  @IsNotEmpty({
    context: OrderError.FILTER_BY_TIME_IS_REQUIRED,
  })
  @IsDateString({}, {
    context: OrderError.FILTER_BY_TIME_IS_INVALID,
  })
  @IsAfterDate('from', {
    context: OrderError.FILTER_BY_TIME_IS_INVALID,
  })
  public to: string;
}
