import { IsBoolean, IsInt, IsNotEmpty, Max, Min } from 'class-validator';
import { MAX_FIAT } from '@api/common/models/P2PConstant';
import { AdminError } from '@api/profile/errors/AdminError';

export class SetGaslessRequest {
  @IsNotEmpty({ context: AdminError.ALLOW_GASLESS_IS_REQUIRED })
  @IsBoolean({ context: AdminError.ALLOW_GASLESS_IS_INVALID })
  public allowGasless: boolean;

  @IsNotEmpty({ context: AdminError.GASLESS_TRANS_LIMIT_IS_REQUIRED })
  @IsInt({ context: AdminError.GASLESS_TRANS_LIMIT_IS_INVALID })
  @Max(MAX_FIAT, { context: AdminError.GASLESS_TRANS_LIMIT_IS_INVALID })
  @Min(0, { context: AdminError.GASLESS_TRANS_LIMIT_IS_INVALID })
  public gaslessTransLimit: number;
}
