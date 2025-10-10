import { IsEnum, IsNotEmpty } from 'class-validator';
import { ConfirmationTransactionResult } from '@api/common/models/P2PEnum';
import { ValidateError } from '@api/common/errors/ValidateError';
import { RefIDParamRequest } from '@api/common/requests/BaseRequest';

export class AdminSupporterConfirmTransactionRequest extends RefIDParamRequest {
  @IsNotEmpty()
  @IsEnum(ConfirmationTransactionResult, {
    each: true,
    context: {
      key: ValidateError.RESULT_IS_INVALID,
    },
  })
  public result: ConfirmationTransactionResult;
}
