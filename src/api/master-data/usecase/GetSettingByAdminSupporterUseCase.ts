import { Service } from 'typedi';
import { MasterDataCommon } from '@api/master-data/models/MasterDataCommon';
import { AdminMasterDataService } from '@api/master-data/services/AdminMasterDataService';

@Service()
export class GetSettingByAdminSupporterUseCase {
  constructor(
    private adminMasterDataService: AdminMasterDataService
  ) {}

  public async getSettings(): Promise<MasterDataCommon> {
    return await this.adminMasterDataService.getLatestMasterDataCommon();
  }
}
