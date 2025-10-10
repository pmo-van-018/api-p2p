import { IsNotEmpty, IsPositive, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { BUY_APPEAL_RESULTS, SELL_APPEAL_RESULTS } from '@api/appeal/models/Appeal';
import { ValidateError } from '@api/appeal/errors/ValidateError';
import { MaxFiat } from '@api/common/validations/Max';

export class DecisionResultRequest {
  @IsNotEmpty({ context: ValidateError.APPEAL_ID_REQUIRED })
  @IsUUID(4, { context: ValidateError.APPEAL_ID_INVALID })
  public appealId: string;

  @IsEnum(BUY_APPEAL_RESULTS || SELL_APPEAL_RESULTS, { context: ValidateError.DECISION_RESULT_INVALID })
  public decisionResult: BUY_APPEAL_RESULTS | SELL_APPEAL_RESULTS;

  @IsOptional()
  @IsPositive({ context: ValidateError.AMOUNT_INVALID })
  @MaxFiat({ context: ValidateError.AMOUNT_INVALID })
  public amount: number;
}
