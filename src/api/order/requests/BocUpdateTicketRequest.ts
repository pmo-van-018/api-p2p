import { IsString, IsNumber, IsBoolean, IsOptional, ValidateNested, IsDateString, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

class DataDto {
  @IsString()
  @IsNotEmpty()
  ID: string;

  @IsString()
  @IsOptional()
  note: string;

  @IsString()
  @IsOptional()
  created_at: string;

  @IsDateString()
  @IsOptional()
  credit_draw_at: string;

  @IsString()
  @IsOptional()
  withdraw_bname: string;

  @IsString()
  @IsOptional()
  withdraw_bcode: string;

  @IsString()
  @IsOptional()
  type: string;

  @IsString()
  @IsOptional()
  bank_no: string;

  @IsString()
  @IsOptional()
  credit_draw_by: string;

  @IsString()
  @IsOptional()
  approved_by: string;

  @IsNumber()
  @IsOptional()
  balance: number;

  @IsString()
  @IsOptional()
  reciever: string;

  @IsString()
  @IsOptional()
  gateway: string;

  @IsString()
  @IsOptional()
  withdraw_bno: string;

  @IsString()
  @IsOptional()
  uniq_id: string;

  @IsNumber()
  @IsOptional()
  status: number;

  @IsOptional()
  @IsString()
  sender?: string;

  @IsOptional()
  @IsString()
  trans_code?: string;

  @IsString()
  @IsOptional()
  cash_receiv_note: string;

  @IsString()
  @IsOptional()
  cash_transfer_by: string;

  @IsDateString()
  @IsOptional()
  cash_transfer_at: string;

  @IsOptional()
  @IsString()
  cancel_at?: string | null;

  @IsOptional()
  @IsString()
  cancel_by?: string | null;

  @IsBoolean()
  @IsOptional()
  raku_ext: boolean;
}

export class BocRequestBodyDto {
  @IsString()
  agent: string;

  @IsString()
  token: string;

  @ValidateNested()
  @Type(() => DataDto)
  data: DataDto;
}
