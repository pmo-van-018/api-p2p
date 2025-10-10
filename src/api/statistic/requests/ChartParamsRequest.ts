import { IsNotEmpty, IsString, IsEmpty, IsUUID } from 'class-validator';

export class ChartParamsRequest {
  @IsNotEmpty()
  @IsUUID(4)
  public userId: string;

  @IsString()
  @IsNotEmpty()
  public type: string;

  @IsEmpty()
  public startDate: string;

  @IsEmpty()
  public endDate: string;
}
