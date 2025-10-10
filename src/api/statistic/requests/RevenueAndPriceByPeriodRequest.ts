
import { GroupTypeRevenue, TradeType } from '@api/common/models';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { ValidateError } from '../errors/ValidateError';

export class RevenueAndPriceByPeriodRequest {
  @IsNotEmpty({ context: ValidateError.FROM_DATE_REQUIRED })
  @IsDate({ context: ValidateError.FROM_DATE_INVALID})
  @Type(() => Date)
  public from: Date;

  @IsNotEmpty({ context: ValidateError.TO_DATE_REQUIRED })
  @IsDate({ context: ValidateError.TO_DATE_INVALID})
  @Type(() => Date)
  public to: Date;

  @IsNotEmpty({ context: ValidateError.GROUP_TYPE_REQUIRED})
  @IsEnum(GroupTypeRevenue, {
    context: ValidateError.GROUP_TYPE_INVALID,
  })
  @Type(() => String)
  public groupType: GroupTypeRevenue;

  @IsOptional()
  @IsEnum(TradeType, { context: ValidateError.TRADE_TYPE_INVALID })
  @Type(() => String)
  public tradeType: TradeType;
}
