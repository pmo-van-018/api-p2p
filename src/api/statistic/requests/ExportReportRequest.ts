import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { FileFormat, ReportType, StaffType, TradeType } from '@api/common/models/P2PEnum';
import { ValidateError } from '@api/statistic/errors/ValidateError';

export class ExportReportRequest {
  @IsOptional({ context: ValidateError.DATE_IS_REQUIRED })
  @IsString({ context: ValidateError.DATE_IS_INVALID })
  public startDate?: string;

  @IsOptional({ context: ValidateError.DATE_IS_REQUIRED })
  @IsString({ context: ValidateError.DATE_IS_INVALID })
  public endDate?: string;

  @IsNotEmpty({ context: ValidateError.REPORT_TYPE_REQUIRED })
  @IsEnum(ReportType, {
    each: true,
    context: ValidateError.REPORT_TYPE_INVALID,
  })
  public reportType: ReportType;

  @IsOptional()
  @IsEnum(TradeType, {
    each: true,
    context: ValidateError.TRADE_TYPE_INVALID,
  })
  public tradeType?: TradeType;

  @IsOptional()
  @IsEnum(StaffType, {
    each: true,
    context: ValidateError.STAFF_TYPE_INVALID,
  })
  public staffType?: StaffType;

  @IsOptional()
  @IsUUID(4, { each: true, context: ValidateError.MANAGER_ID_LIST_INVALID })
  public managerIds: string[];

  @IsOptional()
  @IsUUID(4, { context: ValidateError.USER_ID_INVALID })
  @IsString()
  public userId: string;

  @IsOptional()
  @IsUUID(4, {
    each: true,
    context: ValidateError.ASSET_ID_LIST_INVALID,
  })
  @IsArray({ context: ValidateError.ASSET_ID_LIST_INVALID })
  public assetIds?: string[];

  @IsNotEmpty({ context: ValidateError.FILE_FORMAT_REQUIRED })
  @IsEnum(FileFormat, { context: ValidateError.FILE_FORMAT_INVALID })
  public fileFormat: FileFormat;
}
