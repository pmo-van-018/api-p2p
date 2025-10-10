import { Service } from 'typedi';
import { MasterDataCommon } from '@api/master-data/models/MasterDataCommon';
import { MasterDataLevel } from '@api/master-data/models/MasterDataLevel';
import { AdminMasterDataService } from '@api/master-data/services/AdminMasterDataService';

@Service()
export class GetSettingByAdminUseCase {
  constructor(
    private adminMasterDataService: AdminMasterDataService
  ) {}

  public async getSettings(): Promise<{
    masterDataCommon: MasterDataCommon;
    masterDataLevels: MasterDataLevel[];
  }> {
    const [masterDataCommon, masterDataLevels] = await Promise.all([
      this.adminMasterDataService.getLatestMasterDataCommon(),
      this.adminMasterDataService.getLatestMasterDataLevels(),
    ]);

    return {
      masterDataCommon,
      masterDataLevels,
    };
  }
}
