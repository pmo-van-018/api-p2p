import { IsString, ValidateNested, IsNotEmpty, IsNumber, IsIn, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseBOCDataDto, BaseBOCRequestDto } from './boc/BocBaseRequest';
import { PaymentTicketStatusV2 } from '../enums/PaymentTicketEnum';

export class UpdateTicketDataDto extends BaseBOCDataDto {
  @IsString()
  @IsNotEmpty()
  approved_by: string;

  @IsString()
  @IsNotEmpty()
  approved_at: string;

  @IsString()
  @IsNotEmpty()
  note: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  from_account_name: string;

  @IsString()
  @IsNotEmpty()
  from_account_no: string;

  @IsString()
  @IsNotEmpty()
  from_bank_code: string;

  @IsString()
  @IsNotEmpty()
  from_unique_id: string;

  @IsString()
  @IsNotEmpty()
  to_account_name: string;

  @IsString()
  @IsNotEmpty()
  to_account_no: string;

  @IsString()
  @IsNotEmpty()
  to_bank_code: string;

  @IsString()
  @IsNotEmpty()
  @IsIn([PaymentTicketStatusV2.FINISH, PaymentTicketStatusV2.CANCELLED], {
    message: 'status must be either FINISH or CANCELLED'
  })
  status: string;

  @IsString()
  @IsNotEmpty()
  transfer_code: string;

  @IsString()
  @IsNotEmpty()
  trading_code: string;

  @ValidateIf(o => o.status === PaymentTicketStatusV2.CANCELLED)
  @IsString()
  @IsNotEmpty()
  canceller_at: string;

  @ValidateIf(o => o.status === PaymentTicketStatusV2.CANCELLED)
  @IsString()
  @IsNotEmpty()
  canceller_by: string;

  @ValidateIf(o => o.status === PaymentTicketStatusV2.FINISH)
  @IsString()
  @IsNotEmpty()
  remitter_at: string;

  @ValidateIf(o => o.status === PaymentTicketStatusV2.FINISH)
  @IsString()
  @IsNotEmpty()
  remitter_by: string;
}

export class UpdateTicketRequest extends BaseBOCRequestDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => UpdateTicketDataDto)
  data: UpdateTicketDataDto;
}
