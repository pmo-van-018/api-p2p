import { IsNumber, IsOptional, Max } from 'class-validator';

export class UpdatePublicViewAdjustmentRequest {
  @IsNumber()
  @IsOptional()
  public totalOrderCompleted: number;

  @IsNumber()
  @IsOptional()
  @Max(100)
  public totalRateCompleted: number;
}
