import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { SupportRequestSortField, SupportRequestSearchType, SupportRequestType, SupportRequestQueryStatus } from '@api/support-request/models/SupportRequestEnum';
import { ValidateError } from '@api/support-request/errors/ValidateError';
import { PaginationQueryRequest } from '@api/common/requests/PaginationQueryRequest';

export class SupportRequestListRequest extends PaginationQueryRequest {
  @IsOptional()
  @IsEnum(SupportRequestType, { context: ValidateError.SUPPORT_TYPE_IS_INVALID })
  public type: SupportRequestType;

  @IsOptional()
  @IsEnum(SupportRequestQueryStatus, { context: ValidateError.SUPPORT_REQUEST_STATUS_IS_INVALID })
  public status: SupportRequestQueryStatus = SupportRequestQueryStatus.PENDING;

  @IsOptional()
  @IsBoolean()
  public received: boolean;

  @IsOptional()
  @IsString({ context: ValidateError.DATE_IS_INVALID })
  public createdFrom: string;

  @IsOptional()
  @IsString({ context: ValidateError.DATE_IS_INVALID })
  public createdTo: string;

  @IsOptional()
  @IsEnum(SupportRequestSearchType, { each: true, context: ValidateError.SEARCH_TYPE_INVALID })
  public searchField: SupportRequestSearchType;

  @IsOptional()
  @IsString()
  public searchValue?: string;

  @IsOptional()
  @IsString({ context: ValidateError.DATE_IS_INVALID })
  public completedFrom: string;

  @IsOptional()
  @IsString({ context: ValidateError.DATE_IS_INVALID })
  public completedTo: string;

  @IsOptional()
  @IsEnum(SupportRequestSortField, { context: ValidateError.SORT_FIELD_INVALID })
  public sortField: SupportRequestSortField;

  @IsOptional()
  @IsEnum(['ASC', 'DESC'], { context: ValidateError.SORT_TYPE_INVALID })
  public sortType: 'ASC' | 'DESC';
}
