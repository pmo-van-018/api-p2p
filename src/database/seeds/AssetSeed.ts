import { Connection } from 'typeorm';
import { Factory, Seeder, times } from 'typeorm-seeding';

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
      symbol: 'VIC',
      name: 'VIC',
      network: 'Polygon',
      contract: '0x3da5af77ba7d78b40df8a54375b228015705800b',
      precision: 4,
      orderNumber: 1,
    } as Asset);
    assets.push({
      symbol: 'VIC',
      name: 'VIC',
      network: 'BSC',
      contract: '0x82dFB30EB546d988D94c511Ae99b0F31AE9aDa3A',
      precision: 4,
      orderNumber: 2,
    } as Asset);
    assets.push({
      symbol: 'USDT',
      name: 'USDT',
      network: 'Polygon',
      contract: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      precision: 0,
      orderNumber: 3,
    } as Asset);
    assets.push({
      symbol: 'USDT',
      name: 'USDT',
      network: 'BSC',
      contract: '0x55d398326f99059fF775485246999027B3197955',
      precision: 0,
      orderNumber: 4,
    } as Asset);
    return new Promise((resolve) => {
      resolve(assets);
    });
  }
}
