import { Connection } from 'typeorm';
import { Factory, Seeder, times } from 'typeorm-seeding';

import { MasterDataCommon } from '@api/master-data/models/MasterDataCommon';
import { MasterDataLevel } from '@api/master-data/models/MasterDataLevel';
import { SupportedAsset, SupportedBank, OperationType } from '@api/common/models/P2PEnum';
import {
  TIME_BUY,
  TIME_SELL,
  FEE_RATE,
  MAX_MERCHANT_OPERATOR,
  MAX_ORDER_LIMIT,
  MASTER_DATA_COMMON_DEFAULT,
} from '@api/common/models/P2PConstant';
import { v4 } from 'uuid';
import { Operation } from '@api/profile/models/Operation';
import { faker } from '@faker-js/faker';

export class MasterDataSeed implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    const em = connection.createEntityManager();

    const adminUuid = await this.getAdminUuid(em);
    const assets = await this.fetchMasterDataCommon(adminUuid);
    await times(assets.length, async (n) => {
      const masterData: MasterDataCommon = new MasterDataCommon();
      masterData.supportedBanks = assets[n].supportedBanks;
      masterData.merchantToUserTimeBuys = assets[n].merchantToUserTimeBuys;
      masterData.merchantToUserTimeSells = assets[n].merchantToUserTimeSells;
      masterData.userToMerchantTimeBuys = assets[n].userToMerchantTimeBuys;
      masterData.userToMerchantTimeSells = assets[n].userToMerchantTimeSells;
      masterData.assetNetworkTypes = assets[n].assetNetworkTypes;
      masterData.tradingRuleAssetTypes = assets[n].tradingRuleAssetTypes;
      masterData.minOrderLimit = assets[n].minOrderLimit;
      masterData.maxOrderLimit = assets[n].maxOrderLimit;
      masterData.minPostLimit = assets[n].minPostLimit;
      masterData.maxPostLimit = assets[n].maxPostLimit;
      masterData.fee = assets[n].fee;
      masterData.penaltyFee = assets[n].penaltyFee;
      masterData.userAskMerchantTime = assets[n].userAskMerchantTime;
      masterData.userAskCSTime = assets[n].userAskCSTime;
      masterData.maxMerchantOperator = assets[n].maxMerchantOperator;
      masterData.createdById = assets[n].createdById;
      masterData.userPaymentMethodsLimit = assets[n].userPaymentMethodsLimit;
      masterData.managerPaymentMethodsLimit = assets[n].managerPaymentMethodsLimit;
      masterData.appealReceivedBySupporterLimit = assets[n].appealReceivedBySupporterLimit;
      masterData.appealReceivedByAdminSupporterLimit = assets[n].appealReceivedByAdminSupporterLimit;
      masterData.supportRequestsReceivingLimit = assets[n].supportRequestsReceivingLimit;
      masterData.evidenceProvisionTimeLimit = assets[n].evidenceProvisionTimeLimit;
      masterData.cryptoSendingWaitTimeLimit = assets[n].cryptoSendingWaitTimeLimit;
      return await em.save(masterData);
    });

    const levels = await this.fetchMasterDataLevel(adminUuid);
    await times(levels.length, async (n) => {
      const masterData: MasterDataLevel = new MasterDataLevel();
      masterData.merchantLevel = levels[n].merchantLevel;
      masterData.fee = levels[n].fee;
      (masterData.maxOrderLimit = levels[n].maxOrderLimit),
        (masterData.maxMerchantOperator = levels[n].maxMerchantOperator),
        (masterData.createdById = levels[n].createdById);
      return await em.save(masterData);
    });
  }

  public async fetchMasterDataCommon(adminUuid: string): Promise<MasterDataCommon[]> {
    const assets: MasterDataCommon[] = [];
    assets.push({
      supportedBanks: Object.keys(SupportedBank).map((key) => SupportedBank[key]),
      merchantToUserTimeBuys: TIME_BUY,
      merchantToUserTimeSells: TIME_SELL,
      userToMerchantTimeBuys: TIME_BUY,
      userToMerchantTimeSells: TIME_SELL,
      assetNetworkTypes: Object.values(SupportedAsset),
      tradingRuleAssetTypes: [],
      minOrderLimit: MASTER_DATA_COMMON_DEFAULT.MIN_ORDER_LIMIT,
      maxOrderLimit: MASTER_DATA_COMMON_DEFAULT.MAX_ORDER_LIMIT,
      minPostLimit: MASTER_DATA_COMMON_DEFAULT.MIN_POST_LIMIT,
      maxPostLimit: MASTER_DATA_COMMON_DEFAULT.MAX_POST_LIMIT,
      fee: MASTER_DATA_COMMON_DEFAULT.FEE,
      penaltyFee: MASTER_DATA_COMMON_DEFAULT.PENALTY_FEE,
      userAskMerchantTime: MASTER_DATA_COMMON_DEFAULT.USER_ASK_MERCHANT_TIME,
      userAskCSTime: MASTER_DATA_COMMON_DEFAULT.USER_ASK_CS_TIME,
      maxMerchantOperator: MAX_MERCHANT_OPERATOR,
      createdById: adminUuid,
      userPaymentMethodsLimit: MASTER_DATA_COMMON_DEFAULT.NUMBER_LIMIT_PAYMENT_METHOD,
      managerPaymentMethodsLimit: MASTER_DATA_COMMON_DEFAULT.NUMBER_LIMIT_PAYMENT_METHOD,
      appealReceivedBySupporterLimit: MASTER_DATA_COMMON_DEFAULT.NUMBER_LIMIT_PICK_APPEAL,
      appealReceivedByAdminSupporterLimit: MASTER_DATA_COMMON_DEFAULT.NUMBER_LIMIT_PICK_APPEAL,
      supportRequestsReceivingLimit: MASTER_DATA_COMMON_DEFAULT.NUMBER_LIMIT_PICK_REQUEST,
      evidenceProvisionTimeLimit: MASTER_DATA_COMMON_DEFAULT.APPEAL_EVIDENCE_TIME,
      cryptoSendingWaitTimeLimit: MASTER_DATA_COMMON_DEFAULT.CRYPTO_TRANSACTION_TIME,
    } as MasterDataCommon);
    return new Promise((resolve) => {
      resolve(assets);
    });
  }

  public async fetchMasterDataLevel(adminUuid: string): Promise<MasterDataLevel[]> {
    const assets: MasterDataLevel[] = [];
    assets.push({
      merchantLevel: 1,
      fee: FEE_RATE,
      maxOrderLimit: MAX_ORDER_LIMIT,
      maxMerchantOperator: MAX_MERCHANT_OPERATOR,
      createdById: adminUuid,
    } as MasterDataLevel);
    assets.push({
      merchantLevel: 2,
      fee: FEE_RATE,
      maxOrderLimit: MAX_ORDER_LIMIT,
      maxMerchantOperator: MAX_MERCHANT_OPERATOR,
      createdById: adminUuid,
    } as MasterDataLevel);
    assets.push({
      merchantLevel: 3,
      fee: FEE_RATE,
      maxOrderLimit: MAX_ORDER_LIMIT,
      maxMerchantOperator: MAX_MERCHANT_OPERATOR,
      createdById: adminUuid,
    } as MasterDataLevel);
    assets.push({
      merchantLevel: 4,
      fee: FEE_RATE,
      maxOrderLimit: MAX_ORDER_LIMIT,
      maxMerchantOperator: MAX_MERCHANT_OPERATOR,
      createdById: adminUuid,
    } as MasterDataLevel);
    assets.push({
      merchantLevel: 5,
      fee: FEE_RATE,
      maxOrderLimit: MAX_ORDER_LIMIT,
      maxMerchantOperator: MAX_MERCHANT_OPERATOR,
      createdById: adminUuid,
    } as MasterDataLevel);
    return new Promise((resolve) => {
      resolve(assets);
    });
  }

  private async getAdminUuid(em: any) {
    const operatorExists = await Operation.findOne();
    if (operatorExists) {
      return operatorExists?.id;
    }
    const userUuid = v4();
    const newOperator: Operation = new Operation();
    newOperator.id = userUuid;
    newOperator.nickName = faker.name.fullName();
    newOperator.type = OperationType.SUPER_ADMIN;
    newOperator.merchantLevel = null;
    newOperator.walletAddress = '0x06091623ED2488219E719B3b6b9a1201e70ada55';

    await em.save(newOperator);

    return userUuid;
  }
}
