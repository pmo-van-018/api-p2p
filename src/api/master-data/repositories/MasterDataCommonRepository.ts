import { EntityRepository } from 'typeorm';

import { RepositoryBase } from '@api/infrastructure/abstracts/RepositoryBase';
import { MasterDataCommon } from '@api/master-data/models/MasterDataCommon';

@EntityRepository(MasterDataCommon)
export class MasterDataCommonRepository extends RepositoryBase<MasterDataCommon> {}
