import { Connection } from 'typeorm';
import { Factory, Seeder, times } from 'typeorm-seeding';

import { BLOCKCHAIN_NETWORKS } from '@api/common/models';
import { Asset } from '@api/master-data/models/Asset';

export class AssetSeed implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    const em = connection.createEntityManager();
    const assets = await this.fetchAssets();
    await times(assets.length, async (n) => {
      const asset: Asset = new Asset();

      asset.id = assets[n].id;
      asset.symbol = assets[n].symbol;
      asset.name = assets[n].name;
      asset.network = assets[n].network;
      asset.contract = assets[n].contract;
      asset.precision = assets[n].precision;
      asset.orderNumber = assets[n].orderNumber;

      return await em.save(asset);
    });
  }

  public async fetchAssets(): Promise<Asset[]> {
    const assets: Asset[] = [];
    assets.push({
      symbol: 'USDT',
      name: 'USDT',
      network: BLOCKCHAIN_NETWORKS.TRON,
      contract: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
      precision: 0,
      orderNumber: 6,
    } as Asset);
    return new Promise((resolve) => {
      resolve(assets);
    });
  }
}
