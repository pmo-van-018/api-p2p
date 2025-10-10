import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryRequest } from '@api/common/requests/PaginationQueryRequest';
import {NotificationStatus, NotificationType} from '@api/common/models';
import { ValidateError } from '@api/notification/errors/ValidateError';

export class NotificationListRequest extends PaginationQueryRequest {

  @IsOptional()
  @IsEnum(NotificationType, { each: true, context: ValidateError.NOTIFICATION_TYPE_INVALID })
  public type?: number;

  @IsOptional()
  @IsEnum(NotificationStatus, { each: true, context: ValidateError.NOTIFICATION_STATUS_INVALID })
  public status?: number;
}
