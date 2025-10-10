import { IsNotEmpty, IsDateString, IsUUID } from 'class-validator';
import { ValidateError } from '@api/appeal/errors/ValidateError';

export class AddExtraTimeAppealRequest {
  @IsNotEmpty({ context: ValidateError.APPEAL_ID_REQUIRED })
  @IsUUID(4, { context: ValidateError.APPEAL_ID_INVALID })
  public appealId: string;

  @IsDateString({}, { context: ValidateError.EXTRA_TIME_INVALID })
  public evidentTimeoutAt: string;
}
