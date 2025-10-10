import { IsPastDate } from '@api/common/validations/IsPastDate';
import { Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class TradingVolumeByPeriodRequest {
  @IsNotEmpty()
  @Type(() => String)
  @IsPastDate()
  public day: string;
}
