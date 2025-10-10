import { IsNotEmpty, IsNumber, Max } from 'class-validator';

export class CreatePublicViewAdjustmentRequest {
  @IsNumber()
  @IsNotEmpty()
  public totalOrderCompleted: number;

  @IsNumber()
  @IsNotEmpty()
  @Max(100)
  public totalRateCompleted: number;
}
