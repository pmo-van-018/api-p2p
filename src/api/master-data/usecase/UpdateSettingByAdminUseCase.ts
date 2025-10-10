import { Service } from 'typedi';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { AdminMasterDataService } from '@api/master-data/services/AdminMasterDataService';
import _ from 'lodash';
import { PaymentMethod } from '@api/payment/models/PaymentMethod';
import difference from 'lodash/difference';
import { NOTIFICATION_TYPE, SupportedBank } from '@api/common/models';
import { events } from '@api/subscribers/events';
import { NotificationDisablePayment } from '@api/payment/types/PaymentMethod';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Operation } from '@api/profile/models/Operation';
import { MasterDataCommonCreateRequest } from '@api/master-data/requests/Common/MasterDataCommonCreateRequest';
import { SharedPaymentMethodService } from '@api/payment/services/SharedPaymentMethodService';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { ResourceService } from '@api/master-data/services/ResourceService';
import { SharedPostService } from '@api/post/services/SharedPostService';
import { P2PError } from '@api/common/errors/P2PError';
import { MasterDataError } from '../errors/MasterDataError';
import { TRANSACTION_DEFAULT_OPTIONS } from '@api/common/constants/TransactionConstant';

@Service()
export class UpdateSettingByAdminUseCase {
  constructor(
    private adminMasterDataService: AdminMasterDataService,
    private paymentMethodService: SharedPaymentMethodService,
    private resourceService: ResourceService,
    private postService: SharedPostService,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  public async updateSettings(currentUser: Operation, masterDataCommonRequest: MasterDataCommonCreateRequest) {
    this.log.debug(`Start implement updateSettings method for: ${currentUser.type}, ${currentUser.walletAddress}`);
    const existMasterDataCommon = await this.adminMasterDataService.getLatestMasterDataCommon();
    const masterDataCloneDeep = _.cloneDeep(existMasterDataCommon);

    const {
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
      penaltyFee,
      fee,
      userPaymentMethodsLimit,
      managerPaymentMethodsLimit,
      appealReceivedBySupporterLimit,
      appealReceivedByAdminSupporterLimit,
      supportRequestsReceivingLimit,
      evidenceProvisionTimeLimit,
      cryptoSendingWaitTimeLimit,
      metadata,
    } = this.adminMasterDataService.getAttributesMasterDataCommonFromRequest(masterDataCommonRequest, existMasterDataCommon);
    let paymentMethods: PaymentMethod[] = null;
    const differenceBanks = difference(existMasterDataCommon.supportedBanks, supportedBanks);
    const differenceAssets = difference(existMasterDataCommon.assetNetworkTypes, assetNetworkTypes);

    if (differenceBanks.length) {
      paymentMethods = await this.paymentMethodService.getPaymentMethodListWithBankName(differenceBanks);
    }
    if (this.isExistNetworkMaintainance(masterDataCommonRequest.assetNetworkTypes, existMasterDataCommon.assetMaintenance)) {
      throw new P2PError(MasterDataError.ASSET_IS_BEING_MAINTAINED);
    }
    ((reqBanks) => {
      const index = { val: 0 };
      const allBanks = Object.values(SupportedBank).reduce((a, v) => ({ ...a, [v]: index.val++ }), {});
      reqBanks.sort((thisBank, thatBank) => allBanks[thisBank] - allBanks[thatBank]);
    })(supportedBanks);

    this.log.debug('Start implement updateSettings method for persisting masterDataCommon', currentUser.walletAddress);
    const masterDataCommon = await this.adminMasterDataService.updateMasterDataCommon(
      existMasterDataCommon,
      {
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
        createdById: existMasterDataCommon ? existMasterDataCommon.createdById : currentUser.id,
        updatedById: currentUser.id,
      }
    );
    if (masterDataCloneDeep && masterDataCommon) {
      const notificationKeys: string[] = [];
      if (masterDataCloneDeep.managerPaymentMethodsLimit !== masterDataCommon.managerPaymentMethodsLimit) {
        notificationKeys.push(NOTIFICATION_TYPE.ADMIN_UPDATE_PAYMENT_METHOD_LIMIT_MANAGER);
      }
      if (masterDataCloneDeep.appealReceivedBySupporterLimit !== masterDataCommon.appealReceivedBySupporterLimit) {
        notificationKeys.push(NOTIFICATION_TYPE.ADMIN_UPDATE_APPEAL_LIMIT_MERCHANT_SUPPORTER);
      }
      if (masterDataCloneDeep.appealReceivedByAdminSupporterLimit !== masterDataCommon.appealReceivedByAdminSupporterLimit) {
        notificationKeys.push(NOTIFICATION_TYPE.ADMIN_UPDATE_APPEAL_LIMIT_ADMIN_SUPPORTER);
      }
      if (masterDataCloneDeep.supportRequestsReceivingLimit !== masterDataCommon.supportRequestsReceivingLimit) {
        notificationKeys.push(NOTIFICATION_TYPE.ADMIN_UPDATE_CUSTOMER_REQUEST_LIMIT_ADMIN_SUPPORTER);
      }
      if (masterDataCloneDeep.evidenceProvisionTimeLimit !== masterDataCommon.evidenceProvisionTimeLimit) {
        notificationKeys.push(NOTIFICATION_TYPE.ADMIN_UPDATE_EVIDENCE_TIME_LIMIT);
      }
      if (masterDataCloneDeep.cryptoSendingWaitTimeLimit !== masterDataCommon.cryptoSendingWaitTimeLimit) {
        notificationKeys.push(NOTIFICATION_TYPE.ADMIN_UPDATE_CRYPTO_TRANSFER_TIME_LIMIT);
      }
      if (notificationKeys.length) {
        this.eventDispatcher.dispatch(events.actions.system.adminUpdateSystemConfig, {
          keys: notificationKeys,
          oldMasterDataCommon: masterDataCloneDeep,
          newMasterDataCommon: masterDataCommon,
        });
      }
    }
    await this.adminMasterDataService.updateFeeByLevel(fee);
    await this.adminMasterDataService.removeMasterDataCache();

    this.log.debug('Start implement updateSettings method for checking differenceAssets', currentUser.walletAddress);
    if (differenceAssets?.length) {
      const assetList = await this.resourceService.getAssetByCode(differenceAssets);
      if (assetList.length) {
        const assetIds = assetList.map((as) => as.id);
        const { items } = await this.postService.offlinePostUsingDisableAssets(assetIds);
        if (items.length) {
          this.eventDispatcher.dispatch(events.actions.system.disableAssetByAdmin, items);
        }
      }
    }

    this.log.debug('Start implement updateSettings method for checking paymentMethods', currentUser.walletAddress);
    if (paymentMethods && paymentMethods.length > 0) {
      const paymentMethodIds = paymentMethods.map((paymentMethod) => paymentMethod.id);
      const { items } = await this.postService.offlinePostsUsingDisablePaymentMethod(paymentMethodIds);
      if (items.length) {
        this.eventDispatcher.dispatch(events.actions.system.deletePaymentMethodAdsToOffline, items);
      }
      const notificationDisablePayments: NotificationDisablePayment[] = paymentMethods.map((paymentMethod) => {
        return {
          bankName: paymentMethod.getPaymentMethodField('bank'),
          userId: paymentMethod.userId,
          walletAddress: paymentMethod.user?.walletAddress || paymentMethod.operation?.walletAddress,
          merchantManagerId: paymentMethod.operation?.id,
        };
      });
      this.eventDispatcher.dispatch(events.actions.system.disablePaymentMethodWithAdmin, notificationDisablePayments);
    }

    this.log.debug(`Stop implement updateSettings method for: ${currentUser.type} - ${currentUser.walletAddress}`);
    return null;
  }

  private isExistNetworkMaintainance(assetNetworkTypes: string[], networkMaintainance: string[]): boolean {
    if (!assetNetworkTypes?.length || !networkMaintainance?.length) { return false; }
    return networkMaintainance.some((network) => assetNetworkTypes.includes(network));
  }
}
