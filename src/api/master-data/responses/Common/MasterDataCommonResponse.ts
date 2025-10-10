import { MasterDataCommon } from '@api/master-data/models/MasterDataCommon';
import { SupportedAsset, SupportedBank, SupportedWallet } from '@api/common/models/P2PEnum';

export class MasterDataCommonResponse {
  public id: string;

  public supportedBanks: SupportedBank[];

  public merchantToUserTimeBuys: number[];

  public merchantToUserTimeSells: number[];

  public merchantToUserTimeSell: number;

  public merchantToUserTimeBuy: number;

  public userToMerchantTimeBuys: number[];

  public userToMerchantTimeSells: number[];

  public assetNetworkTypes: SupportedAsset[];

  public tradingRuleAssetTypes: SupportedAsset[];

  public assetMaintenance: string[];

  public walletMaintenance: SupportedWallet[];

  public minOrderLimit: number;

  public maxOrderLimit: number;

  public minPostLimit: number;

  public maxPostLimit: number;

  public userAskMerchantTime: number;

  public userAskCSTime: number;

  public fee: number;

  public penaltyFee: number;

  public maxMerchantOperator: number;

  public userPaymentMethodsLimit: number;

  public managerPaymentMethodsLimit: number;

  public appealReceivedBySupporterLimit: number;

  public appealReceivedByAdminSupporterLimit: number;

  public supportRequestsReceivingLimit: number;

  public evidenceProvisionTimeLimit: number;

  public cryptoSendingWaitTimeLimit: number;

  constructor(masterDataCommon: MasterDataCommon) {
    this.id = masterDataCommon.id;
    this.supportedBanks = masterDataCommon.supportedBanks;
    this.merchantToUserTimeBuys = masterDataCommon.merchantToUserTimeBuys;
    this.merchantToUserTimeSells = masterDataCommon.merchantToUserTimeSells;
    this.merchantToUserTimeBuy = masterDataCommon.merchantToUserTimeBuy;
    this.merchantToUserTimeSell = masterDataCommon.merchantToUserTimeSell;
    this.userToMerchantTimeBuys = masterDataCommon.userToMerchantTimeBuys;
    this.userToMerchantTimeSells = masterDataCommon.userToMerchantTimeSells;
    this.assetNetworkTypes = masterDataCommon.assetNetworkTypes;
    this.tradingRuleAssetTypes = masterDataCommon.tradingRuleAssetTypes;
    this.minOrderLimit = masterDataCommon.minOrderLimit;
    this.maxOrderLimit = masterDataCommon.maxOrderLimit;
    this.minPostLimit = masterDataCommon.minPostLimit;
    this.maxPostLimit = masterDataCommon.maxPostLimit;
    this.userAskMerchantTime = masterDataCommon.userAskMerchantTime;
    this.userAskCSTime = masterDataCommon.userAskCSTime;
    this.fee = masterDataCommon.fee;
    this.penaltyFee = masterDataCommon.penaltyFee;
    this.maxMerchantOperator = masterDataCommon.maxMerchantOperator;

    this.userPaymentMethodsLimit = masterDataCommon.userPaymentMethodsLimit;
    this.managerPaymentMethodsLimit = masterDataCommon.managerPaymentMethodsLimit;
    this.appealReceivedBySupporterLimit = masterDataCommon.appealReceivedBySupporterLimit;
    this.appealReceivedByAdminSupporterLimit = masterDataCommon.appealReceivedByAdminSupporterLimit;
    this.supportRequestsReceivingLimit = masterDataCommon.supportRequestsReceivingLimit;
    this.evidenceProvisionTimeLimit = masterDataCommon.evidenceProvisionTimeLimit;
    this.cryptoSendingWaitTimeLimit = masterDataCommon.cryptoSendingWaitTimeLimit;
    this.assetMaintenance = masterDataCommon.assetMaintenance;
    this.walletMaintenance = masterDataCommon.walletMaintenance;
  }
}
