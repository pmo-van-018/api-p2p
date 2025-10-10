import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';

import { TwoFactorAuthRepository } from '@api/auth/repositories/TwoFactorAuthRepository';
import { TwoFactorAuthService } from '@api/auth/services/TwoFactorAuthService';
import { TwoFactorAuth } from '@api/auth/models/TwoFactorAuth';

@Service()
export class OperationTwoFactorAuthService extends TwoFactorAuthService {
  constructor(@InjectRepository() protected twoFactorAuthRepository: TwoFactorAuthRepository) {
    super(twoFactorAuthRepository);
  }

  protected getIdentityCondition(
    twoFactorAuth: string | TwoFactorAuth
  ): Partial<Pick<TwoFactorAuth, 'operationId' | 'userId'>> {
    return {
      operationId: this.getIdentity(twoFactorAuth),
    };
  }

  protected getIdentity(twoFactorAuth: string | TwoFactorAuth): string {
    return typeof twoFactorAuth === 'string' ? twoFactorAuth : twoFactorAuth.operationId;
  }
}
