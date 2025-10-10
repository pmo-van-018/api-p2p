import { MasterDataCommon } from '@api/master-data/models/MasterDataCommon';

export class MerchantOperatorSettingResponse {

  public userToMerchantTimeBuys: number[];

  public userToMerchantTimeSells: number[];

  public minOrderLimit: number;

  public maxOrderLimit: number;

  public minPostLimit: number;

  public maxPostLimit: number;

  public fee: number;

  public penaltyFee: number;

  constructor(masterDataCommon: MasterDataCommon) {
    this.userToMerchantTimeBuys = masterDataCommon.userToMerchantTimeBuys;
    this.userToMerchantTimeSells = masterDataCommon.userToMerchantTimeSells;
    this.minOrderLimit = masterDataCommon.minOrderLimit;
    this.maxOrderLimit = masterDataCommon.maxOrderLimit;
    this.minPostLimit = masterDataCommon.minPostLimit;
    this.maxPostLimit = masterDataCommon.maxPostLimit;
    this.fee = masterDataCommon.fee;
    this.penaltyFee = masterDataCommon.penaltyFee;
  }
}
