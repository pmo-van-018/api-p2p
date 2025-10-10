import { IsNotEmpty } from 'class-validator';
import { ValidateError } from '@api/notification/errors/ValidateError';

export class NotificationSubscribeCreateRequest {
  @IsNotEmpty({
    context: {
      key: ValidateError.PLAYER_ID_IS_INVALID,
    },
  })
  public playerId: string;
}
