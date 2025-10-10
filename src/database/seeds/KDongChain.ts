import { SupportedAsset } from '@api/common/models';
import { CHAIN, TOKEN } from '@api/constant/chain';
import { Asset } from '@api/master-data/models/Asset';
import { MasterDataCommon } from '@api/master-data/models/MasterDataCommon';
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';

export class KDongChain implements Seeder {
  async run(factory: Factory, connection: Connection): Promise<void> {
    const em = connection.createEntityManager();

    // Select master data
    const masterDataRs = await em.find(MasterDataCommon);

    const masterData = masterDataRs[0];

    if (!masterData) {
      return;
    }

    masterData.assetNetworkTypes = Object.values(SupportedAsset);
    await em.save(masterData);

    const kdongAsset = {
      symbol: TOKEN.KDG,
      name: TOKEN.KDG,
      network: CHAIN.KDONG,
      contract: '',
      precision: 0,
      orderNumber: 7,
    } as Asset;
    await em.save(em.create(Asset, kdongAsset));
  }
}
