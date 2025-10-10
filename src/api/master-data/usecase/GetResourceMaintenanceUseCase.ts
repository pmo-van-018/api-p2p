import { Service } from 'typedi';
import { AdminMasterDataService } from '@api/master-data/services/AdminMasterDataService';
import { SupportedWallet } from '@api/common/models';

@Service()
export class GetResourceMaintenanceUseCase {
  constructor(
    private adminMasterDataService: AdminMasterDataService
  ) {}

  public async getResourceMaintenance(): Promise<{assetMaintenance: string[], walletMaintenance: SupportedWallet[]}> {
    const masterDataCommon = await this.adminMasterDataService.getLatestMasterDataCommon();
    return {
      assetMaintenance: masterDataCommon.assetMaintenance,
      walletMaintenance: masterDataCommon.walletMaintenance,
    };
  }
}
