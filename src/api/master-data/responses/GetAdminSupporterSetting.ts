import { MasterDataCommon } from '@api/master-data/models/MasterDataCommon';

export class GetAdminSupporterSetting {

  public appealReceiveLimit: number;

  public requestReceiveLimit: number;

  constructor(masterDataCommon: MasterDataCommon) {
    this.appealReceiveLimit = masterDataCommon.appealReceivedByAdminSupporterLimit;
    this.requestReceiveLimit = masterDataCommon.supportRequestsReceivingLimit;
  }
}
