import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { FileFormat, TradeType } from '@api/common/models/P2PEnum';
import { ValidateError } from '@api/statistic/errors/ValidateError';
import { UserReportType } from '@api/statistic/models/StatisticEnum';

export class UserExportReportRequest {
  @IsOptional({ context: ValidateError.DATE_IS_REQUIRED })
  @IsString({ context: ValidateError.DATE_IS_INVALID })
  public startDate: string;

  @IsOptional({ context: ValidateError.DATE_IS_REQUIRED })
  @IsString({ context: ValidateError.DATE_IS_INVALID })
  public endDate: string;

  @IsNotEmpty({ context: ValidateError.REPORT_TYPE_REQUIRED })
  @IsEnum(UserReportType, {
    each: true,
    context: ValidateError.REPORT_TYPE_INVALID,
  })
  public reportType: UserReportType;

  @IsOptional()
  @IsEnum(TradeType, {
    each: true,
    context: ValidateError.TRADE_TYPE_INVALID,
  })
  public tradeType?: TradeType;

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
