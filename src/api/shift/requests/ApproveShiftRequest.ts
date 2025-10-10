import { IsBeforeDate } from '@api/common/validations/IsBeforeDate';
import { IsOnlyDate } from '@api/common/validations/IsOnlyDate';
import { IsEnum, IsOptional } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { FilterDateType, SearchTextType } from '../enums/ShiftEnum';
import { ValidateError } from '@api/shift/errors/ValidateError';

export class ApproveShiftRequest {
  @IsOptional()
  @IsOnlyDate({ context: ValidateError.DATE_IS_INVALID })
  @IsBeforeDate('endDate', { context: ValidateError.DATE_RANGE_IS_INVALID })
  @JSONSchema({ type: 'string', example: '2021-01-01' })
  public startDate?: string;

  @IsOptional()
  @IsOnlyDate({ context: ValidateError.DATE_IS_INVALID })
  @JSONSchema({ type: 'string', example: '2021-01-01' })
  public endDate?: string;

  @IsOptional()
  @IsEnum(FilterDateType, { context: ValidateError.FILTER_DATE_TYPE_IS_INVALID })
  @JSONSchema({ type: 'string', examples: ['CHECK_IN', 'CHECK_OUT'] })
  public filterDateType?: FilterDateType;

  @IsOptional()
  public search?: string;

  @IsOptional()
  @IsEnum(SearchTextType, { context: ValidateError.SEARCH_TYPE_IS_INVALID })
  @JSONSchema({ type: 'string', examples: ['NICK_NAME', 'WALLET_ADDRESS'] })
  public searchTextType?: SearchTextType;
}
