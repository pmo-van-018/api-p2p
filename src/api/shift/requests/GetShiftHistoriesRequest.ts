import { PaginationQueryRequest } from '@api/common/requests/PaginationQueryRequest';
import { IsBeforeDate } from '@api/common/validations/IsBeforeDate';
import { IsOnlyDate } from '@api/common/validations/IsOnlyDate';
import { LIST_PARAM_TYPE } from '@api/common/validations/ValidationType';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { FilterDateType, ShiftOrderField } from '../enums/ShiftEnum';

export class GetShiftHistoriesRequest extends PaginationQueryRequest {
  @IsOptional()
  @IsOnlyDate({
    context: {
      key: LIST_PARAM_TYPE.DATE_IS_INVALID,
    },
  })
  @IsBeforeDate('endDate', {
    message: '',
    context: {
      key: LIST_PARAM_TYPE.DATE_RANGE_IS_INVALID,
    },
  })
  @JSONSchema({ type: 'string', example: '2021-01-01' })
  public startDate?: string;

  @IsOptional()
  @IsOnlyDate({
    context: {
      key: LIST_PARAM_TYPE.DATE_IS_INVALID,
    },
  })
  @JSONSchema({ type: 'string', example: '2021-01-01' })
  public endDate?: string;

  @IsOptional()
  @IsEnum(FilterDateType)
  public searchType?: FilterDateType;

  @IsOptional()
  @IsString()
  public status?: string;

  @IsOptional()
  @IsEnum(ShiftOrderField)
  @JSONSchema({ type: 'string', example: 'createdAt' })
  public orderField?: string;

  @IsOptional()
  @JSONSchema({ type: 'string', example: 'DESC' })
  @IsEnum(['ASC', 'DESC'])
  public orderDirection?: string;
}
