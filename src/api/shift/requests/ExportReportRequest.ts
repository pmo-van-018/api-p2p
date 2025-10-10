import { FileFormat } from '@api/common/models';
import { IsBeforeDate } from '@api/common/validations/IsBeforeDate';
import { LIST_PARAM_TYPE } from '@api/common/validations/ValidationType';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

export class ExportReportRequest {
  @IsOptional()
  @IsUUID(4, { each: true })
  @IsArray()
  public operatorIds: string[];

  @IsOptional()
  @IsString()
  @IsBeforeDate('endDate', {
    message: '',
    context: {
      key: LIST_PARAM_TYPE.DATE_RANGE_IS_INVALID,
    },
  })
  @JSONSchema({ type: 'string', example: '2021-01-01' })
  public startDate?: string;

  @IsOptional()
  @IsString()
  @JSONSchema({ type: 'string', example: '2021-01-01' })
  public endDate?: string;

  @IsNotEmpty()
  @IsEnum(FileFormat)
  public fileFormat?: FileFormat;
}
