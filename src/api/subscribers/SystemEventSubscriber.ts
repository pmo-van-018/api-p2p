import { EventSubscriber, On } from 'event-dispatch';

import { Container } from 'typedi';

import { events } from './events';
import { SharedNotificationService } from '@api/notification/services/SharedNotificationService';
import { NOTIFICATION_TYPE, NotificationType, OperationType, TradeType } from '@api/common/models/P2PEnum';
import { Order } from '@api/order/models/Order';
import { Operation } from '@api/profile/models/Operation';
import { Post } from '@api/post/models/Post';
import { SUB_DOMAIN_OPERATIONS_LINK } from '@api/common/models/P2PConstant';
import { NotificationDisablePayment } from '@api/payment/types/PaymentMethod';
import { MasterDataCommon } from '@api/master-data/models/MasterDataCommon';
import { SharedProfileService } from '@api/profile/services/SharedProfileService';
import { BalanceConfigurationData, NotificationMessage } from '@api/notification/types/Notification';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { SharedResourceService } from '@api/master-data/services/SharedResourceService';
import { Asset } from '@api/master-data/models/Asset';
import { SharedBlockchainTransactionService } from '@api/order/services/SharedBlockchainTransactionService';
import { BalanceConfigurationService } from '@api/profile/services/BalanceConfigurationService';
import { formatCrypto } from '@base/utils/amount.utils';
import { TRANSACTION_DEFAULT_OPTIONS } from '@api/common/constants/TransactionConstant';

@EventSubscriber()
export class AppealEventSubscriber {
  private subDomainOperationsLink = SUB_DOMAIN_OPERATIONS_LINK;
  private notificationService: SharedNotificationService;
  private sharedOperationService: SharedProfileService;
  private sharedBlockchainTransactionService: SharedBlockchainTransactionService;
  private resourceService: SharedResourceService;
  private balanceConfigurationService: BalanceConfigurationService;

  constructor() {
    this.notificationService = Container.get<SharedNotificationService>(SharedNotificationService);
    this.sharedOperationService = Container.get<SharedProfileService>(SharedProfileService);
    this.resourceService = Container.get<SharedResourceService>(SharedResourceService);
    this.sharedBlockchainTransactionService = Container.get<SharedBlockchainTransactionService>(
      SharedBlockchainTransactionService
    );
    this.balanceConfigurationService = Container.get<BalanceConfigurationService>(BalanceConfigurationService);
  }

  @On(events.actions.system.availableAmountLessThanMinAmount)
  public async onAvailableAmountLessThanMinAmount(order: Order): Promise<void> {
    this.notificationService.createNotification({
      notificationCase: NOTIFICATION_TYPE.SYSTEM_CHANGE_ADS_TO_OFFLINE_AMOUNT_LOWER_FIAT,
      transactionId: order.post.id,
      transactionRefId: order.post.refId,
      transactionType: order.type === TradeType.BUY ? 'mua' : 'bán',
      username: order.user.nickName,
      amount: order.amount,
      currency: order.asset.name,
      datetime: order.appeal?.createdAt || null,
      type: NotificationType.SYSTEM,
      walletAddress: order.user.walletAddress,
      merchantId: order.merchant.id,
    });
  }

  @On(events.actions.system.availableAmountEqualZero)
  public async onAvailableAmountEqualZero(orders: Order[]): Promise<void> {
    for (const order of orders) {
      await this.notificationService.createNotification({
        notificationCase: NOTIFICATION_TYPE.SYSTEM_CHANGE_ADS_TO_CLOSE_AMOUNT_0,
        transactionId: order.post.id,
        transactionRefId: order.post.refId,
        transactionType: order.type === TradeType.BUY ? 'mua' : 'bán',
        username: order.user.nickName,
        amount: order.amount,
        currency: order.asset.name,
        datetime: order.appeal?.createdAt || null,
        type: NotificationType.SYSTEM,
        walletAddress: order.user.walletAddress,
        merchantId: order.merchant.id,
      });
    }
  }

  @On(events.actions.system.deletePaymentMethodWithMerchant)
  public async onDeletePaymentMethodWithMerchant({
    walletAddress,
    userId,
    merchantManagerId,
    bankName,
    merchantsOperators,
  }: {
    walletAddress: '';
    userId: null;
    merchantManagerId: null;
    bankName: '';
    merchantsOperators: Operation[];
  }): Promise<void> {
    if (userId) {
      await this.notificationService.createNotification({
        notificationCase: NOTIFICATION_TYPE.BANK_DELETE_PAYMENT_METHOD_TO_USER,
        type: NotificationType.SYSTEM,
        endUserId: userId,
        walletAddress,
        bankName,
      });
    }
    if (merchantManagerId) {
      await this.notificationService.createNotification({
        notificationCase: NOTIFICATION_TYPE.BANK_DELETE_PAYMENT_METHOD_TO_MERCHANT,
        type: NotificationType.SYSTEM,
        walletAddress,
        bankName,
        merchantManagerId,
        link: `${this.subDomainOperationsLink}/merchant-manager/payments`,
      });
    }
    if (merchantsOperators.length) {
      for (const merchant of merchantsOperators) {
        await this.notificationService.createNotification({
          notificationCase: NOTIFICATION_TYPE.BANK_DELETE_PAYMENT_METHOD_TO_MERCHANT,
          type: NotificationType.SYSTEM,
          walletAddress,
          bankName,
          merchantId: merchant.id,
          link: '',
        });
      }
    }
  }

  @On(events.actions.system.disablePaymentMethodWithAdmin)
  public async disablePaymentMethodWithAdmin(data: NotificationDisablePayment[]): Promise<void> {
    for (const notificationData of data) {
      if (notificationData.userId) {
        await this.notificationService.createNotification({
          notificationCase: NOTIFICATION_TYPE.BANK_DELETE_PAYMENT_METHOD_TO_USER,
          type: NotificationType.SYSTEM,
          endUserId: notificationData.userId,
          walletAddress: notificationData.walletAddress,
          bankName: notificationData.bankName,
        });
      }
      if (notificationData.merchantManagerId) {
        await this.notificationService.createNotification({
          notificationCase: NOTIFICATION_TYPE.BANK_DELETE_PAYMENT_METHOD_TO_MERCHANT,
          type: NotificationType.SYSTEM,
          walletAddress: notificationData.walletAddress,
          bankName: notificationData.bankName,
          merchantManagerId: notificationData.merchantManagerId,
          link: `${this.subDomainOperationsLink}/merchant-manager/payments`,
        });
      }
    }
  }

  @On(events.actions.system.deletePaymentMethodAdsToOffline)
  public async onDeletePaymentMethodAdsToOffline(posts: Post[]): Promise<void> {
    const mapPostByBanks = new Map<string, string>();
    for (const post of posts) {
      const mapKey = JSON.stringify({
        bankName: post.paymentMethod.getPaymentMethodField('bank'),
        merchantId: post.merchantId,
      });
      let postIdStr = `#${post.refId}`;
      mapPostByBanks.has(mapKey) ? (postIdStr = mapPostByBanks.get(mapKey).concat(`, ${postIdStr}`)) : postIdStr;
      mapPostByBanks.set(mapKey, postIdStr);
    }
    if (mapPostByBanks.size === 0) {
      return;
    }
    for (const postsByBank of mapPostByBanks) {
      const mapKey = JSON.parse(postsByBank[0]);
      this.notificationService.createNotification({
        notificationCase: NOTIFICATION_TYPE.BANK_DELETE_PAYMENT_METHOD_ADS_TO_OFFLINE,
        type: NotificationType.SYSTEM,
        currency: '',
        walletAddress: '',
        transactionIds: postsByBank[1],
        merchantId: mapKey.merchantId,
        bankName: mapKey.bankName,
      });
    }
  }

  @On(events.actions.system.disableAssetByAdmin)
  public async onDisableAssetAdsToOffline(posts: Post[]): Promise<void> {
    const mapAssets = new Map<string, string>();
    for (const post of posts) {
      const mapKey = JSON.stringify({
        assetNetwork: `${post.asset.name} (${post.asset.network})`,
        merchantId: post.merchantId,
      });
      let postIdStr = `#${post.refId}`;
      mapAssets.has(mapKey) ? (postIdStr = mapAssets.get(mapKey).concat(`, ${postIdStr}`)) : postIdStr;
      mapAssets.set(mapKey, postIdStr);
    }
    if (mapAssets.size === 0) {
      return;
    }

    for (const asset of mapAssets) {
      const mapKey = JSON.parse(asset[0]);
      this.notificationService.createNotification({
        notificationCase: NOTIFICATION_TYPE.ASSET_DISABLED_BY_ADMIN,
        type: NotificationType.SYSTEM,
        assetNetworks: mapKey.assetNetwork,
        walletAddress: '',
        transactionIds: asset[1],
        merchantId: mapKey.merchantId,
      });
    }
  }

  @On(events.actions.post.managerUpdatePost)
  public async onManagerUpdatePost(post: Post): Promise<void> {
    await this.notificationService.createNotification({
      notificationCase: NOTIFICATION_TYPE.MANAGER_UPDATE_POSTING_TO_OPERATOR,
      type: NotificationType.TRANSACTION,
      walletAddress: '',
      transactionId: post.refId,
      merchantId: post.merchantId,
    });
  }

  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  @On(events.actions.system.adminUpdateSystemConfig)
  public async onAdminUpdateSystemConfig(data: {
    keys: string[];
    oldMasterDataCommon: MasterDataCommon;
    newMasterDataCommon: MasterDataCommon;
  }): Promise<void> {
    const { keys, newMasterDataCommon, oldMasterDataCommon } = data;
    const notificationPromies = [];
    for (const key of keys) {
      switch (key) {
        case NOTIFICATION_TYPE.ADMIN_UPDATE_PAYMENT_METHOD_LIMIT_MANAGER: {
          const managers = await this.sharedOperationService.findAllActiveOperations([OperationType.MERCHANT_MANAGER]);
          for (const manager of managers) {
            notificationPromies.push(
              this.notificationService.createNotification({
                notificationCase: NOTIFICATION_TYPE.ADMIN_UPDATE_PAYMENT_METHOD_LIMIT_MANAGER,
                type: NotificationType.SYSTEM,
                merchantManagerId: manager.id,
                walletAddress: manager.walletAddress,
                oldValue: oldMasterDataCommon.managerPaymentMethodsLimit,
                newValue: newMasterDataCommon.managerPaymentMethodsLimit,
              })
            );
          }
          break;
        }
        case NOTIFICATION_TYPE.ADMIN_UPDATE_APPEAL_LIMIT_ADMIN_SUPPORTER: {
          const adminSupporters = await this.sharedOperationService.findAllActiveOperations([
            OperationType.ADMIN_SUPPORTER,
          ]);
          for (const supporter of adminSupporters) {
            notificationPromies.push(
              this.notificationService.createNotification({
                notificationCase: NOTIFICATION_TYPE.ADMIN_UPDATE_APPEAL_LIMIT_ADMIN_SUPPORTER,
                type: NotificationType.SYSTEM,
                adminId: supporter.id,
                walletAddress: supporter.walletAddress,
                oldValue: oldMasterDataCommon.appealReceivedByAdminSupporterLimit,
                newValue: newMasterDataCommon.appealReceivedByAdminSupporterLimit,
              })
            );
          }
          break;
        }
        case NOTIFICATION_TYPE.ADMIN_UPDATE_APPEAL_LIMIT_MERCHANT_SUPPORTER: {
          const operations = await this.sharedOperationService.findAllActiveOperations([
            OperationType.MERCHANT_MANAGER,
            OperationType.MERCHANT_SUPPORTER,
          ]);
          for (const operation of operations) {
            const body: NotificationMessage = {
              notificationCase: NOTIFICATION_TYPE.ADMIN_UPDATE_APPEAL_LIMIT_MERCHANT_SUPPORTER,
              type: NotificationType.SYSTEM,
              walletAddress: operation.walletAddress,
              oldValue: oldMasterDataCommon.appealReceivedBySupporterLimit,
              newValue: newMasterDataCommon.appealReceivedBySupporterLimit,
            };
            if (operation.type === OperationType.MERCHANT_MANAGER) {
              body.merchantManagerId = operation.id;
            } else {
              body.merchantSupporterId = operation.id;
            }
            notificationPromies.push(this.notificationService.createNotification(body));
          }
          break;
        }
        case NOTIFICATION_TYPE.ADMIN_UPDATE_CUSTOMER_REQUEST_LIMIT_ADMIN_SUPPORTER: {
          const adminSupporters = await this.sharedOperationService.findAllActiveOperations([
            OperationType.ADMIN_SUPPORTER,
          ]);
          for (const supporter of adminSupporters) {
            notificationPromies.push(
              this.notificationService.createNotification({
                notificationCase: NOTIFICATION_TYPE.ADMIN_UPDATE_CUSTOMER_REQUEST_LIMIT_ADMIN_SUPPORTER,
                type: NotificationType.SYSTEM,
                adminId: supporter.id,
                walletAddress: supporter.walletAddress,
                oldValue: oldMasterDataCommon.supportRequestsReceivingLimit,
                newValue: newMasterDataCommon.supportRequestsReceivingLimit,
              })
            );
          }
          break;
        }
        case NOTIFICATION_TYPE.ADMIN_UPDATE_EVIDENCE_TIME_LIMIT: {
          const roles = [
            OperationType.MERCHANT_MANAGER,
            OperationType.MERCHANT_SUPPORTER,
            OperationType.MERCHANT_OPERATOR,
            OperationType.ADMIN_SUPPORTER,
          ];
          const operations = await this.sharedOperationService.findAllActiveOperations(roles);
          for (const operation of operations) {
            const notificationBody: NotificationMessage = {
              notificationCase: NOTIFICATION_TYPE.ADMIN_UPDATE_EVIDENCE_TIME_LIMIT,
              type: NotificationType.SYSTEM,
              walletAddress: operation.walletAddress,
              oldValue: oldMasterDataCommon.evidenceProvisionTimeLimit,
              newValue: newMasterDataCommon.evidenceProvisionTimeLimit,
            };
            switch (operation.type) {
              case OperationType.ADMIN_SUPPORTER: {
                notificationBody.adminId = operation.id;
                break;
              }
              case OperationType.MERCHANT_MANAGER: {
                notificationBody.merchantManagerId = operation.id;
                break;
              }
              case OperationType.MERCHANT_SUPPORTER: {
                notificationBody.merchantSupporterId = operation.id;
                break;
              }
              case OperationType.MERCHANT_OPERATOR: {
                notificationBody.merchantId = operation.id;
                break;
              }
              default: {
                break;
              }
            }
            notificationPromies.push(this.notificationService.createNotification(notificationBody));
          }
          break;
        }
        case NOTIFICATION_TYPE.ADMIN_UPDATE_CRYPTO_TRANSFER_TIME_LIMIT: {
          const operators = await this.sharedOperationService.findAllActiveOperations([
            OperationType.MERCHANT_OPERATOR,
          ]);
          for (const operator of operators) {
            notificationPromies.push(
              this.notificationService.createNotification({
                notificationCase: NOTIFICATION_TYPE.ADMIN_UPDATE_CRYPTO_TRANSFER_TIME_LIMIT,
                type: NotificationType.SYSTEM,
                merchantId: operator.id,
                walletAddress: operator.walletAddress,
                oldValue: oldMasterDataCommon.cryptoSendingWaitTimeLimit,
                newValue: newMasterDataCommon.cryptoSendingWaitTimeLimit,
              })
            );
          }
          break;
        }
      }
    }
    if (notificationPromies.length) {
      await Promise.allSettled(notificationPromies);
    }
  }

  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  @On(events.actions.balanceConfig.updateBalanceConfig)
  public async onManagerUpdateBalanceConfiguration(data: {
    balanceConfigs: BalanceConfigurationData[];
    managerId: string;
  }): Promise<void> {
    const { balanceConfigs, managerId } = data;
    const operators = await this.sharedOperationService.findOperationsByManagerId(managerId, [
      OperationType.MERCHANT_OPERATOR,
    ]);
    const assetBalances = await this.formatAssetBalancesNotification(balanceConfigs);
    for (const operator of operators) {
      await this.notificationService.createNotification({
        notificationCase: NOTIFICATION_TYPE.MANAGER_UPDATE_BALANCE_CONFIGURATION,
        assetBalances,
        type: NotificationType.SYSTEM,
        walletAddress: operator.walletAddress,
        merchantId: operator.id,
      });
    }
  }

  @On(events.actions.balanceConfig.reachedThreshold)
  public async onReachedThresholdBalance(data: { asset: Asset; operation: Operation }): Promise<void> {
    const { asset, operation } = data;
    const balanceConfig = await this.balanceConfigurationService.getBalanceConfigurationByAssetId(
      operation.merchantManagerId,
      asset.id
    );
    const currentBalance = await this.sharedBlockchainTransactionService.getBalanceByAsset(
      operation.walletAddress,
      asset
    );
    if (
      Number(currentBalance.toFixed(2)) >= Number(balanceConfig?.balance || 0) &&
      Number(balanceConfig?.balance || 0) !== 0
    ) {
      await this.sendNotificationReachingThreshold(asset, Number(currentBalance.toFixed(2)), operation);
    }
  }

  private async sendNotificationReachingThreshold(asset: Asset, amount: number, operation: Operation): Promise<void> {
    await this.notificationService.createNotification({
      notificationCase: NOTIFICATION_TYPE.OPERATOR_REACHED_THRESHOLD_OF_BALANCE,
      assetNetworks: `${asset?.name} ${asset?.network}`,
      amount,
      type: NotificationType.SYSTEM,
      walletAddress: operation.walletAddress,
      merchantId: operation.id,
    });
  }

  private async formatAssetBalancesNotification(balanceConfigs: BalanceConfigurationData[]): Promise<string> {
    const assets = await this.resourceService.getAssets();
    const results = [];
    balanceConfigs.forEach((balanceConfig) => {
      const asset = assets.find((as) => as.id === balanceConfig.assetId);
      results.push(
        `${asset.name} ${asset.network}: Từ ${formatCrypto(balanceConfig.oldBalance)} sang ${formatCrypto(
          balanceConfig.balance
        )}`
      );
    });
    return results.join(' | ');
  }
}
