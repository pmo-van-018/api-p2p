import { MasterDataCommon } from '@api/master-data/models/MasterDataCommon';

export class MerchantSupporterSettingResponse {

  public appealReceivedBySupporterLimit: number;

  constructor(masterDataCommon: MasterDataCommon) {
    this.appealReceivedBySupporterLimit = masterDataCommon.appealReceivedBySupporterLimit;
  }
}
