import { Service } from 'typedi';
import { AdminMasterDataService } from '@api/master-data/services/AdminMasterDataService';
import { SupportedBank } from '@api/common/models';

@Service()
export class GetSupportedBanksUseCase {
  constructor(
    private adminMasterDataService: AdminMasterDataService
  ) {}

  public async getSupportedBanks(): Promise<SupportedBank[]> {
    const masterDataCommon = await this.adminMasterDataService.getLatestMasterDataCommon();
    return masterDataCommon.supportedBanks;
  }
}
