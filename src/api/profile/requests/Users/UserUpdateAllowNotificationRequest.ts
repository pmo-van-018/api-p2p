import { IsArray, IsEnum } from 'class-validator';
import { NotificationType } from '@api/common/models';
import { ValidateError } from '@api/profile/errors/ValidateError';

export class UserUpdateAllowNotificationRequest {
  @IsArray({ context: ValidateError.ALLOW_NOTIFICATION_LIST_INVALID })
  @IsEnum(NotificationType, {
    each: true,
    context: ValidateError.ALLOW_NOTIFICATION_LIST_INVALID,
  })
  public allowNotification: NotificationType[];
}
