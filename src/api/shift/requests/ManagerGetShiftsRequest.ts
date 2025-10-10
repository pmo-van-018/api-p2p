import { PaginationQueryRequest } from '@api/common/requests/PaginationQueryRequest';
import { IsBeforeDate } from '@api/common/validations/IsBeforeDate';
import { IsOnlyDate } from '@api/common/validations/IsOnlyDate';
import { ShiftStatus } from '@api/shift/models/Shift';
import { IsEnum, IsIn, IsOptional } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { FilterDateType, SearchTextType, ShiftOrderDirection, ShiftOrderField } from '@api/shift/enums/ShiftEnum';
import { ValidateError } from '@api/shift/errors/ValidateError';

export class ManagerGetShiftsRequest extends PaginationQueryRequest {
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

  @IsOptional()
  @IsEnum(ShiftStatus, { context: ValidateError.STATUS_IS_INVALID })
  @IsIn([ShiftStatus.FINISHED, ShiftStatus.APPROVED], { context: ValidateError.STATUS_IS_INVALID })
  @JSONSchema({ type: 'string', examples: ['FINISHED', 'APPROVED'] })
  public status: ShiftStatus;

  @IsOptional()
  @IsEnum(ShiftOrderField, { context: ValidateError.ORDER_FIELD_IS_INVALID })
  @JSONSchema({ type: 'string', examples: ['checkInAt', 'checkOutAt', 'totalAmount', 'duringTime'] })
  public orderField?: ShiftOrderField;

  @IsOptional()
  @IsEnum(ShiftOrderDirection, { context: ValidateError.ORDER_DIRECTION_IS_INVALID })
  @JSONSchema({ type: 'string', examples: ['ASC', 'DESC'] })
  public orderDirection?: ShiftOrderDirection;
}
