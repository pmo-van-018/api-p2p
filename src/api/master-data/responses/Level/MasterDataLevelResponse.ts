import { MasterDataLevel } from '@api/master-data/models/MasterDataLevel';

export class MasterDataLevelResponse {
  public id: string;

  public level: number;

  public fee: number;

  public maxOrderLimit: number;

  public maxMerchantOperator: number;

  constructor(masterDataLevel: MasterDataLevel) {
    this.id = masterDataLevel.id;
    this.level = masterDataLevel.merchantLevel;
    this.fee = masterDataLevel.fee;
    this.maxOrderLimit = masterDataLevel.maxOrderLimit;
    this.maxMerchantOperator = masterDataLevel.maxMerchantOperator;
  }
}
