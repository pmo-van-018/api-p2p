import { IsString, ValidateNested,  IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseBOCDataDto, BaseBOCRequestDto } from './boc/BocBaseRequest';

export class NotifyTicketHandlerDataDto extends BaseBOCDataDto {
  @IsString()
  @IsNotEmpty()
  approved_by: string;

  @IsString()
  @IsNotEmpty()
  approved_at: string;
}

export class NotifyTicketHandlerRequest extends BaseBOCRequestDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => NotifyTicketHandlerDataDto)
  data: NotifyTicketHandlerDataDto;
}
