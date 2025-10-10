import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import _ from 'lodash';
import { MasterDataCommonRepository } from '@api/master-data/repositories/MasterDataCommonRepository';
import { MasterDataCommon } from '@api/master-data/models/MasterDataCommon';
import { wrap } from '@base/utils/redis-client';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { MasterDataLevelRepository } from '@api/master-data/repositories/MasterDataLevelRepository';
import { MasterDataLevel } from '@api/master-data/models/MasterDataLevel';
import {
  MASTER_DATA_COMMON_DEFAULT,
  MAX_MERCHANT_LEVEL,
  MIN_MERCHANT_LEVEL,
  TIME_BUY,
  TIME_SELL
} from '@api/common/models/P2PConstant';
import { Between } from 'typeorm';
import { MasterDataCommonCreateRequest } from '@api/master-data/requests/Common/MasterDataCommonCreateRequest';
import { SupportedAsset, SupportedBank } from '@api/common/models';

const CACHE_REDIS_LATEST_MASTER_DATA_COMMON_KEY = '__cache_latest_master_data_common__';
const CACHE_REDIS_LATEST_MASTER_DATA_LEVEL_KEY = '__cache_latest_master_data_level__';

@Service()
export class BaseMasterDataService {
  constructor(
    @InjectRepository() protected readonly masterDataCommonRepository: MasterDataCommonRepository,
    @InjectRepository() protected readonly masterDataLevelRepository: MasterDataLevelRepository,
    @Logger(__filename) protected log: LoggerInterface
  ) {}

  /**
   * Get latest master data level with cache.
   */
  public async getLatestMasterDataCommon(): Promise<MasterDataCommon> {
    this.log.debug('Start getLatestMasterDataCommon');
    const masterDataCommon = await wrap(this.getLatestMasterDataCommonRedisKey(), () =>
      this.findLatestMasterDataCommon()
    );
    this.log.debug('Stop getLatestMasterDataCommon');
    return masterDataCommon;
  }

  public async getLatestMasterDataLevel(level: number): Promise<MasterDataLevel> {
    this.log.debug('Start getLatestMasterDataLevel');
    // Due to business, we need to priority get data from master data level.
    // If it doesn't exist, we get data from master data common.
    const masterDataLevel = await wrap(this.getLatestMasterDataLevelRedisKey(level), () =>
      this.findLatestMasterDataLevel(level)
    );
    if (!masterDataLevel) {
      return await wrap(this.getLatestMasterDataLevelRedisKey(level), () => this.getMasterDataLevelFromCommon(level));
    }
    return masterDataLevel;
  }

  /**
   * Get latest all master data level with cache.
   */
  public async getLatestMasterDataLevels(): Promise<MasterDataLevel[]> {
    const masterDataLevels = await wrap(this.getLatestMasterDataLevelRedisKey(), () =>
      this.findLatestMasterDataLevels()
    );
    if (!masterDataLevels.length) {
      const masterDataLevel = await wrap(this.getLatestMasterDataLevelRedisKey(), () =>
        this.getMasterDataLevelFromCommon()
      );
      return [masterDataLevel];
    }
    return masterDataLevels;
  }

  public getAttributesMasterDataCommonFromRequest(
    masterDataRequest: MasterDataCommonCreateRequest,
    existMasterDataCommon?: MasterDataCommon
  ): MasterDataCommonCreateRequest {
    this.log.info('Start getAttributesMasterDataCommonFromRequest');
    let {
      supportedBanks,
      merchantToUserTimeBuys,
      merchantToUserTimeSells,
      merchantToUserTimeBuy,
      merchantToUserTimeSell,
      userToMerchantTimeBuys,
      userToMerchantTimeSells,
      assetNetworkTypes,
      minOrderLimit,
      userAskMerchantTime,
      userAskCSTime,
      fee,
      penaltyFee,
      maxOrderLimit,
      minPostLimit,
      maxPostLimit,
      userPaymentMethodsLimit,
      managerPaymentMethodsLimit,
      appealReceivedBySupporterLimit,
      appealReceivedByAdminSupporterLimit,
      supportRequestsReceivingLimit,
      evidenceProvisionTimeLimit,
      cryptoSendingWaitTimeLimit,
      metadata,
    } = masterDataRequest;

    supportedBanks = supportedBanks
      ? supportedBanks
      : existMasterDataCommon
        ? existMasterDataCommon.supportedBanks
        : Object.keys(SupportedBank).map((key) => SupportedBank[key]);
    merchantToUserTimeBuys = merchantToUserTimeBuys
      ? merchantToUserTimeBuys
      : existMasterDataCommon
        ? existMasterDataCommon.merchantToUserTimeBuys
        : TIME_BUY;
    merchantToUserTimeSells = merchantToUserTimeSells
      ? merchantToUserTimeSells
      : existMasterDataCommon
        ? existMasterDataCommon.merchantToUserTimeSells
        : TIME_SELL;
    merchantToUserTimeBuy = merchantToUserTimeBuy
      ? merchantToUserTimeBuy
      : existMasterDataCommon
        ? existMasterDataCommon.merchantToUserTimeBuy
        : MASTER_DATA_COMMON_DEFAULT.MERCHANT_TO_USER_TIME_BUY;
    merchantToUserTimeSell = merchantToUserTimeSell
      ? merchantToUserTimeSell
      : existMasterDataCommon
        ? existMasterDataCommon.merchantToUserTimeSell
        : MASTER_DATA_COMMON_DEFAULT.MERCHANT_TO_USER_TIME_SELL;
    userToMerchantTimeBuys = userToMerchantTimeBuys
      ? userToMerchantTimeBuys
      : existMasterDataCommon
        ? existMasterDataCommon.userToMerchantTimeBuys
        : TIME_BUY;
    userToMerchantTimeSells = userToMerchantTimeSells
      ? userToMerchantTimeSells
      : existMasterDataCommon
        ? existMasterDataCommon.userToMerchantTimeSells
        : TIME_SELL;
    assetNetworkTypes = assetNetworkTypes
      ? assetNetworkTypes
      : existMasterDataCommon
        ? existMasterDataCommon.assetNetworkTypes
        : Object.keys(SupportedAsset).map((key) => SupportedAsset[key]);
    minOrderLimit = minOrderLimit
      ? minOrderLimit
      : existMasterDataCommon
        ? existMasterDataCommon.minOrderLimit
        : MASTER_DATA_COMMON_DEFAULT.MIN_ORDER_LIMIT;
    maxOrderLimit = maxOrderLimit
      ? maxOrderLimit
      : existMasterDataCommon
        ? existMasterDataCommon.maxOrderLimit
        : MASTER_DATA_COMMON_DEFAULT.MAX_ORDER_LIMIT;
    minPostLimit = minPostLimit
      ? minPostLimit
      : existMasterDataCommon
        ? existMasterDataCommon.minPostLimit
        : MASTER_DATA_COMMON_DEFAULT.MIN_POST_LIMIT;
    maxPostLimit = maxPostLimit
      ? maxPostLimit
      : existMasterDataCommon
        ? existMasterDataCommon.maxPostLimit
        : MASTER_DATA_COMMON_DEFAULT.MAX_POST_LIMIT;
    userAskMerchantTime = userAskMerchantTime
      ? userAskMerchantTime
      : existMasterDataCommon
        ? existMasterDataCommon.userAskMerchantTime
        : MASTER_DATA_COMMON_DEFAULT.USER_ASK_MERCHANT_TIME;
    userAskCSTime = userAskCSTime
      ? userAskCSTime
      : existMasterDataCommon
        ? existMasterDataCommon.userAskCSTime
        : MASTER_DATA_COMMON_DEFAULT.USER_ASK_CS_TIME;
    fee = fee ? fee : existMasterDataCommon ? existMasterDataCommon.fee : MASTER_DATA_COMMON_DEFAULT.FEE;
    penaltyFee = penaltyFee
      ? penaltyFee
      : existMasterDataCommon
        ? existMasterDataCommon.penaltyFee
        : MASTER_DATA_COMMON_DEFAULT.PENALTY_FEE;
    userPaymentMethodsLimit = userPaymentMethodsLimit
      ? userPaymentMethodsLimit
      : existMasterDataCommon
        ? existMasterDataCommon.userPaymentMethodsLimit
        : MASTER_DATA_COMMON_DEFAULT.NUMBER_LIMIT_PAYMENT_METHOD;
    managerPaymentMethodsLimit = managerPaymentMethodsLimit
      ? managerPaymentMethodsLimit
      : existMasterDataCommon
        ? existMasterDataCommon.managerPaymentMethodsLimit
        : MASTER_DATA_COMMON_DEFAULT.NUMBER_LIMIT_PAYMENT_METHOD;
    appealReceivedBySupporterLimit = appealReceivedBySupporterLimit
      ? appealReceivedBySupporterLimit
      : existMasterDataCommon
        ? existMasterDataCommon.appealReceivedBySupporterLimit
        : MASTER_DATA_COMMON_DEFAULT.NUMBER_LIMIT_PICK_APPEAL;
    appealReceivedByAdminSupporterLimit = appealReceivedByAdminSupporterLimit
      ? appealReceivedByAdminSupporterLimit
      : existMasterDataCommon
        ? existMasterDataCommon.appealReceivedByAdminSupporterLimit
        : MASTER_DATA_COMMON_DEFAULT.NUMBER_LIMIT_PICK_APPEAL;
    supportRequestsReceivingLimit = supportRequestsReceivingLimit
      ? supportRequestsReceivingLimit
      : existMasterDataCommon
        ? existMasterDataCommon.supportRequestsReceivingLimit
        : MASTER_DATA_COMMON_DEFAULT.NUMBER_LIMIT_PICK_REQUEST;
    evidenceProvisionTimeLimit = evidenceProvisionTimeLimit
      ? evidenceProvisionTimeLimit
      : existMasterDataCommon
        ? existMasterDataCommon.evidenceProvisionTimeLimit
        : MASTER_DATA_COMMON_DEFAULT.APPEAL_EVIDENCE_TIME;
    cryptoSendingWaitTimeLimit = cryptoSendingWaitTimeLimit
      ? cryptoSendingWaitTimeLimit
      : existMasterDataCommon
        ? existMasterDataCommon.cryptoSendingWaitTimeLimit
        : MASTER_DATA_COMMON_DEFAULT.CRYPTO_TRANSACTION_TIME;
    metadata = metadata
      ? _.merge(existMasterDataCommon?.metadata || {}, metadata)
      : existMasterDataCommon
        ? existMasterDataCommon.metadata
        : {};

    return {
      supportedBanks,
      merchantToUserTimeBuys,
      merchantToUserTimeSells,
      merchantToUserTimeBuy,
      merchantToUserTimeSell,
      userToMerchantTimeBuys,
      userToMerchantTimeSells,
      assetNetworkTypes,
      minOrderLimit,
      maxOrderLimit,
      minPostLimit,
      maxPostLimit,
      userAskMerchantTime,
      userAskCSTime,
      fee,
      penaltyFee,
      userPaymentMethodsLimit,
      managerPaymentMethodsLimit,
      appealReceivedBySupporterLimit,
      appealReceivedByAdminSupporterLimit,
      supportRequestsReceivingLimit,
      evidenceProvisionTimeLimit,
      cryptoSendingWaitTimeLimit,
      metadata,
    };
  }

  /**
   * Get latest master data level without cache.
   */
  protected async findLatestMasterDataCommon(): Promise<MasterDataCommon | null> {
    return await this.masterDataCommonRepository.findOne();
  }

  protected async findLatestMasterDataLevel(level: number | string): Promise<MasterDataLevel | null> {
    return await this.masterDataLevelRepository.findOne({
      where: {
        merchantLevel: level,
      },
    });
  }

  protected async getMasterDataLevelFromCommon(
    merchantLevel: number = MIN_MERCHANT_LEVEL
  ): Promise<MasterDataLevel | null> {
    const masterDataCommon = await this.getLatestMasterDataCommon();
    if (!masterDataCommon) {
      return null;
    }
    return this.masterDataLevelRepository.merge(this.masterDataLevelRepository.create(), {
      merchantLevel,
      fee: masterDataCommon.fee,
      maxOrderLimit: masterDataCommon.maxOrderLimit,
      maxMerchantOperator: masterDataCommon.maxMerchantOperator,
    });
  }

  protected getLatestMasterDataCommonRedisKey(): string {
    return CACHE_REDIS_LATEST_MASTER_DATA_COMMON_KEY;
  }

  protected getLatestMasterDataLevelRedisKey(level?: number | string): string {
    if (!level) {
      return CACHE_REDIS_LATEST_MASTER_DATA_LEVEL_KEY;
    }
    return CACHE_REDIS_LATEST_MASTER_DATA_LEVEL_KEY + level;
  }

  protected async findLatestMasterDataLevels(): Promise<MasterDataLevel[]> {
    const masterDataLevels = await this.masterDataLevelRepository.find({
      where: { merchantLevel: Between(MIN_MERCHANT_LEVEL, MAX_MERCHANT_LEVEL) },
      order: {
        merchantLevel: 'ASC',
      },
    });
    return masterDataLevels;
  }
}
