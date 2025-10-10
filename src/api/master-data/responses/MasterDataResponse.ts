import { MasterDataCommon } from '@api/master-data/models/MasterDataCommon';
import { MasterDataLevel } from '@api/master-data/models/MasterDataLevel';
import { MasterDataCommonResponse } from './Common/MasterDataCommonResponse';
import { MasterDataLevelResponse } from './Level/MasterDataLevelResponse';

export class MasterDataResponse {
  public masterDataCommon: MasterDataCommonResponse;

  public masterDataLevels: MasterDataLevelResponse[];

  constructor(masterData: { masterDataCommon: MasterDataCommon; masterDataLevels: MasterDataLevel[] }) {
    const { masterDataCommon, masterDataLevels } = masterData;
    this.masterDataCommon = new MasterDataCommonResponse(masterDataCommon);
    this.masterDataLevels = masterDataLevels.map((masterDataLevel) => new MasterDataLevelResponse(masterDataLevel));
  }
}
