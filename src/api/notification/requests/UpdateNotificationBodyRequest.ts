import { IsEnum } from 'class-validator';
import { NotificationStatus } from '@api/common/models';
import { ValidateError } from '@api/notification/errors/ValidateError';

export class UpdateNotificationBodyRequest {
  @IsEnum(NotificationStatus, { each: true, context: ValidateError.NOTIFICATION_STATUS_INVALID })
  public status: number;
}
