import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { EXPORT_REPORT_TYPE, LIST_PARAM_TYPE, ORDER_LIST_TYPE } from '@api/common/validations/ValidationType';
import { FileFormat, ReportType, StaffType, TradeType } from '@api/common/models/P2PEnum';

export class ExportReportRequest {
  @IsOptional()
  @IsString({
    context: {
      key: LIST_PARAM_TYPE.DATE_IS_INVALID,
    },
  })
  public startDate: string;

  @IsOptional()
  @IsString({
    context: {
      key: LIST_PARAM_TYPE.DATE_IS_INVALID,
    },
  })
  public endDate: string;

  @IsNotEmpty()
  @IsEnum(ReportType, {
    each: true,
    context: {
      key: EXPORT_REPORT_TYPE.REPORT_TYPE_INVALID,
    },
  })
  public reportType: ReportType;

  @IsOptional()
  @IsUUID(4, {
    each: true,
  })
  public managerIds: string[];

  @IsOptional()
  @IsEnum(TradeType, {
    each: true,
    context: {
      key: ORDER_LIST_TYPE.TYPE_IS_INVALID,
    },
  })
  public tradeType?: TradeType;

  @IsOptional()
  @IsUUID(4, {
    each: true,
  })
  @IsArray()
  public assetIds?: string[];

  @IsOptional()
  @IsEnum(StaffType, {
    each: true,
    context: {
      key: ORDER_LIST_TYPE.TYPE_IS_INVALID,
    },
  })
  public staffType?: StaffType;

  @IsOptional()
  @IsUUID(4, {
    each: true,
  })
  @IsArray()
  public staffIds?: string[];

  @IsOptional()
  @IsUUID(4)
  @IsString()
  public userId: string;

  @IsNotEmpty()
  @IsEnum(FileFormat)
  public fileFormat: FileFormat;
}
