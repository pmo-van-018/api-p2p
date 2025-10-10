import { EntityRepository } from 'typeorm';

import { RepositoryBase } from '@api/infrastructure/abstracts/RepositoryBase';
import { TwoFactorAuth } from '../models/TwoFactorAuth';

@EntityRepository(TwoFactorAuth)
export class TwoFactorAuthRepository extends RepositoryBase<TwoFactorAuth> {}
