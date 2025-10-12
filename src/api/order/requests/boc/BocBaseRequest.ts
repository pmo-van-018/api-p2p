import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, ValidateNested } from 'class-validator';

export class BaseBOCDataDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class BaseBOCRequestDto {
  @IsString()
  @IsNotEmpty()
  agent: string;

  @IsString()
  @IsNotEmpty()
  token: string;

  @ValidateNested()
  @Type(() => BaseBOCDataDto)
  data: BaseBOCDataDto;
}
