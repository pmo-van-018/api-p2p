import { IsSecretKey } from '@api/common/validations/IsSecretKey';
import { ValidateError } from '@api/telegram-bot/errors/ValidateError';
import { IsNotEmpty, Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

export class TelegramBotSecureRequest {
  @IsNotEmpty({ context: ValidateError.APPEAL_SECRET_KEY_REQUIRED })
  @Length(15, 15, { context: ValidateError.APPEAL_SECRET_KEY_LENGTH_INVALID })
  @IsSecretKey('APPEAL_', { context: ValidateError.APPEAL_SECRET_KEY_FORMAT_INVALID })
  @JSONSchema({ type: 'string' })
  public appealSecretKey: string;
}
