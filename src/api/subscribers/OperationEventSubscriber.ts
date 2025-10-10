import { EventSubscriber, On } from 'event-dispatch';

import { Operation } from '@api/profile/models/Operation';
import { events } from './events';
import Container from 'typedi';
import { AVATARS_CACHE_KEY, SharedProfileService } from '@api/profile/services/SharedProfileService';
import { Post } from '@api/post/models/Post';
import { NOTIFICATION_TYPE, NotificationType } from '@api/common/models';
import { SharedNotificationService } from '@api/notification/services/SharedNotificationService';
import { deleteCache } from '@base/utils/redis-client';
import { SharedStatisticService } from '@api/statistic/services/SharedStatisticService';

@EventSubscriber()
export class OperationEventSubscriber {
  private statisticService: SharedStatisticService;
  private operationService: SharedProfileService;
  private notificationService: SharedNotificationService;

  constructor() {
    this.statisticService = Container.get<SharedStatisticService>(SharedStatisticService);
    this.notificationService = Container.get<SharedNotificationService>(SharedNotificationService);
    this.operationService = Container.get<SharedProfileService>(SharedProfileService);
  }

  @On(events.actions.operation.created)
  public async onOperationCreated(operation: Operation): Promise<void> {
    const statisticId = await this.statisticService.createByOperationId(operation.id);
    await this.operationService.updateByOperatorId(operation.id, { statisticId });
  }

  @On(events.actions.operation.deletePaymentMethodByManager)
  public async onDeletePaymentMethodAdsByManager(posts: Post[]): Promise<void> {
    await this.storePaymentMethodAdsByManager(posts, NOTIFICATION_TYPE.BANK_DELETE_PAYMENT_METHOD_ADS_BY_MANAGER);
  }

  @On(events.actions.operation.updatePaymentMethodByManager)
  public async onUpdatePaymentMethodAdsByManager(posts: Post[]): Promise<void> {
    await this.storePaymentMethodAdsByManager(posts, NOTIFICATION_TYPE.BANK_UPDATE_PAYMENT_METHOD_ADS_BY_MANAGER);
  }

  @On(events.actions.operation.onManagerUpdateAvatar)
  public async onManagerUpdateAvatar(): Promise<void> {
    await deleteCache(AVATARS_CACHE_KEY);
    await this.operationService.getAvatarsUsed();
  }

  @On(events.actions.admin.onSettingManagerGasless)
  public async onSettingManagerGasless(data: { managerId: string, allowGasless: boolean, gaslessTransLimit: number }): Promise<void> {
    this.notificationService.createNotification({
      notificationCase: data.allowGasless ? NOTIFICATION_TYPE.ADMIN_ENABLE_GASLESS_TO_MANAGER : NOTIFICATION_TYPE.ADMIN_DISABLE_GASLESS_TO_MANAGER,
      type: NotificationType.SYSTEM,
      merchantManagerId: data.managerId,
      amount: data.gaslessTransLimit,
    });
  }

  @On(events.actions.operator.activatedSuperAdmin)
  public async onActiveSuperAdmin(data: { adminId: string, nickName: string, walletAddress: string }): Promise<void> {
    await this.notificationService.createNotification({
      notificationCase: NOTIFICATION_TYPE.SUPER_ADMIN_ACTIVED,
      type: NotificationType.SYSTEM,
      adminId: data.adminId,
      username: data.nickName,
      walletAddress: data.walletAddress,
    });
  }

  private async storePaymentMethodAdsByManager(posts: Post[], notificationMessage: string): Promise<void> {
    const postRefIds = new Map<string, string>();
    for (const post of posts) {
      const mapKey = JSON.stringify({
        merchantId: post.merchantId,
      });
      let postRefIdStr = `#${post.refId}`;
      postRefIds.has(mapKey) ? (postRefIdStr = postRefIds.get(mapKey).concat(`, ${postRefIdStr}`)) : postRefIdStr = `#${post.refId}`;
      postRefIds.set(mapKey, postRefIdStr);
    }
    if (postRefIds.size === 0) {
      return;
    }
    for (const postRefId of postRefIds) {
      const mapKey = JSON.parse(postRefId[0]);
      this.notificationService.createNotification({
        notificationCase: notificationMessage,
        type: NotificationType.SYSTEM,
        transactionIds: postRefId[1],
        merchantId: mapKey.merchantId,
      });
    }
  }
}
