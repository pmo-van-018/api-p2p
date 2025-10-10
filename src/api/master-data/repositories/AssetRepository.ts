import { EntityRepository, Repository } from 'typeorm';

import { Asset } from '@api/master-data/models/Asset';

@EntityRepository(Asset)
export class AssetRepository extends Repository<Asset> {
  public async getAssetByCode(codes: string[]): Promise<Asset[]> {
    return this.createQueryBuilder('asset')
      .where(`CONCAT(asset.name, ' (', asset.network, ')' ) IN (:...codes)`, { codes })
      .getMany();
  }
}
