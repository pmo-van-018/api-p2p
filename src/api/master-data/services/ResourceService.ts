import { Service } from 'typedi';
import { AssetRepository } from '@api/master-data/repositories/AssetRepository';
import { FiatRepository } from '@api/master-data/repositories/FiatRepository';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export class ResourceService {
  constructor(
    @InjectRepository() protected assetRepository: AssetRepository,
    @InjectRepository() protected fiatRepository: FiatRepository
  ) {}

  public async getResource() {
    return await Promise.all([this.assetRepository.find(), this.fiatRepository.find()]);
  }

  public async getAssetByCode(codes: string[]) {
    return await this.assetRepository.getAssetByCode(codes);
  }

  public async getAllAssets() {
    return await this.assetRepository.find();
  }
}
