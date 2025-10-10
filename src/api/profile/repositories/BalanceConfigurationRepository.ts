import { EntityRepository } from 'typeorm';

import { RepositoryBase } from '@api/infrastructure/abstracts/RepositoryBase';
import { BalanceConfiguration } from '../models/BalanceConfiguration';

@EntityRepository(BalanceConfiguration)
export class BalanceConfigurationRepository extends RepositoryBase<BalanceConfiguration> {}
