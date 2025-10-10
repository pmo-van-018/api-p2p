import { EntityRepository } from 'typeorm';

import { RepositoryBase } from '@api/infrastructure/abstracts/RepositoryBase';
import { MasterDataLevel } from '@api/master-data/models/MasterDataLevel';

@EntityRepository(MasterDataLevel)
export class MasterDataLevelRepository extends RepositoryBase<MasterDataLevel> {}
