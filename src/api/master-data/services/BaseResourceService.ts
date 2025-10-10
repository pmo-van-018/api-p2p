import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Asset } from '@api/master-data/models/Asset';
import { AssetRepository } from '@api/master-data/repositories/AssetRepository';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { wrap } from '@base/utils/redis-client';
import { FiatRepository } from '@api/master-data/repositories/FiatRepository';
import { Fiat } from '@api/master-data/models/Fiat';

@Service()
export class BaseResourceService {
  constructor(
    @InjectRepository() protected assetRepository: AssetRepository,
    @InjectRepository() protected fiatRepository: FiatRepository,
    @Logger(__filename) protected log: LoggerInterface
  ) {}

  public async getAssetById(id: string): Promise<Asset | null> {
    try {
      return await wrap(`__cache_asset_${id}`, () => this.assetRepository.findOne({ id }));
    } catch (error: any) {
      this.log.error(error.message);
    }
    return null;
  }

  public async getAssetByNameAndNetwork(name: string, network: string): Promise<Asset | null> {
    try {
      return await wrap(`__cache_asset_${name}_${network}`, () =>
        this.assetRepository.findOne({
          where: {
            name,
            network,
          },
        })
      );
    } catch (error: any) {
      this.log.error(error.message);
    }
    return null;
  }

  public async getAssets(): Promise<Asset[] | null> {
    try {
      return await wrap(`__cache_asset__`, () => this.assetRepository.find());
    } catch (error: any) {
      this.log.error(error.message);
    }
    return null;
  }

  public async getFiatById(id: string): Promise<Fiat | null> {
    try {
      return await wrap(`__cache_fiat_${id}`, () => this.fiatRepository.findOne({ id }));
    } catch (error: any) {
      this.log.error(error.message);
    }
    return null;
  }

  public async getFiatByName(name: string): Promise<Fiat | null> {
    try {
      return await wrap(`__cache_fiat_${name}`, () => this.fiatRepository.findOne({ name }));
    } catch (error: any) {
      this.log.error(error.message);
    }
    return null;
  }

  public async getFiat(): Promise<Fiat | null> {
    try {
      return await wrap(`__cache_fiat__`, () => this.fiatRepository.findOne());
    } catch (error: any) {
      this.log.error(error.message);
    }
    return null;
  }

  public async getAllFiat(): Promise<Fiat[] | null> {
    try {
      return this.fiatRepository.find();
    } catch (error: any) {
      this.log.error(error.message);
    }
    return null;
  }
}
