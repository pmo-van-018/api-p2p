import { OneSignalAppRole, OperationType, UserType } from '@api/common/models/P2PEnum';
import { Notification } from '@api/notification/models/Notification';
import { NotificationUser } from '@api/notification/models/NotificationUser';
import { NotificationRepository } from '@api/notification/repositories/NotificationRepository';
import { SharedProfileService } from '@api/profile/services/SharedProfileService';
import { SocketFactory } from '@api/sockets/SocketFactory';
import { events } from '@api/subscribers/events';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { env } from '@base/env';
import * as OneSignal from '@onesignal/node-onesignal';
import { Configuration } from '@onesignal/node-onesignal';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';

type configurationOnesignal = {
  appId: string;
  apiKey: string;
  webDomain: string;
};
type OneSignalAppType = {
  defaultApi: OneSignal.DefaultApi;
  appConfig: configurationOnesignal;
};

@Service()
export class PushNotificationService {
  private oneSignalMap: Map<OneSignalAppRole, OneSignalAppType> = new Map();
  constructor(
    private socketFactory: SocketFactory,
    private sharedProfileService: SharedProfileService,
    @InjectRepository() private notificationRepository: NotificationRepository,
    @Logger(__filename) private log: LoggerInterface
  ) {
    this.oneSignalMap.set(OneSignalAppRole.USER, this.getInstanceOneSignal(env.oneSignalUser));
    this.oneSignalMap.set(OneSignalAppRole.ADMIN, this.getInstanceOneSignal(env.oneSignalAdmin));
    this.oneSignalMap.set(OneSignalAppRole.OPERATION, this.getInstanceOneSignal(env.oneSignalOperation));
  }

  public async pushNotification(notificationUser: NotificationUser, notification: Notification, roles: number[]) {
    try {
      let userInfo;
      if (notificationUser.userId) {
        this.log.debug(`Start implement pushNotification for: ${notificationUser.userId} and roles: ${roles}`);
        userInfo = await this.sharedProfileService.getUserById(notificationUser.userId);
      } else {
        this.log.debug(`Start implement pushNotification for: ${notificationUser.operationId} and roles: ${roles}`);
        userInfo = await this.sharedProfileService.getOperationById(notificationUser.operationId);
      }
      if (!userInfo) {
        this.log.error(
          'Failed to push notification because user info null, userId:',
          notificationUser.userId || notificationUser.operationId
        );
        return;
      }
      const appConfig = this.oneSignalMap.get(this.getOnesignalAppType(userInfo.type));
      if (!appConfig || !appConfig.appConfig || !appConfig.defaultApi) {
        this.log.error('Failed to push notification because app config null, roles: ', roles);
        return;
      }
      const oneSignal: OneSignal.Notification = new OneSignal.Notification();
      const totalUnread = await this.notificationRepository.countNotificationUnreadByNotificationType(
        userInfo.id,
        null
      );
      this.socketFactory.emitToRoom([userInfo.walletAddress], {
        ...notification,
        notificationUsers: notificationUser,
        total: totalUnread || 0,
        event: events.objects.notification,
      });
      oneSignal.app_id = appConfig.appConfig.appId;
      oneSignal.include_external_user_ids = [userInfo.walletAddress];
      oneSignal.headings = {
        en: notification.title,
      };
      oneSignal.contents = {
        en: notification.description,
      };

      if (notification.link) {
        oneSignal.url = appConfig.appConfig.webDomain + notification.link;
      }
      const response = await appConfig.defaultApi.createNotification(oneSignal);
      if (!response?.id && response?.errors) {
        this.log.error('Failed to push notification: ', JSON.stringify(response.errors));
      }
      this.log.debug(`Stop implement pushNotification for: ${notificationUser.userId}`);
    } catch (error) {
      this.log.error('Failed to push notification key: ', notification.description);
      this.log.error('Failed to push notification: ', error);
    }
  }

  public async sendNotificationToManagerSwapWalletAddress(notification: Notification, walletAddress: string) {
    try {
      this.log.debug(`Start implement pushNotification for: ${walletAddress}`);
      const appConfig = this.oneSignalMap.get(OneSignalAppRole.OPERATION);
      if (!appConfig || !appConfig.appConfig || !appConfig.defaultApi) {
        this.log.error('Failed to push notification to swap wallet because app config null');
        return;
      }
      const oneSignal: OneSignal.Notification = new OneSignal.Notification();
      oneSignal.app_id = env.oneSignalOperation.appId;
      oneSignal.include_external_user_ids = [walletAddress];
      oneSignal.headings = {
        en: notification.title,
      };
      oneSignal.contents = {
        en: notification.description,
      };

      if (notification.link) {
        oneSignal.url = env.oneSignalOperation.webDomain + notification.link;
      }
      await appConfig.defaultApi.createNotification(oneSignal);
      this.log.debug(`Stop implement pushNotification for: ${walletAddress}`);
    } catch (error) {
      this.log.error('Failed to push notification key: ', notification.description);
      this.log.error('Failed to push notification: ', error);
    }
  }

  private getInstanceOneSignal(appConfig: configurationOnesignal): OneSignalAppType {
    const APP_KEY_PROVIDER: { getToken(): string } = {
      getToken(): string {
        return appConfig.apiKey;
      },
    };
    const configuration: Configuration = OneSignal.createConfiguration({
      authMethods: {
        app_key: {
          tokenProvider: APP_KEY_PROVIDER,
        },
      },
    });
    return {
      defaultApi: new OneSignal.DefaultApi(configuration),
      appConfig,
    };
  }

  private getOnesignalAppType(role: UserType | OperationType): OneSignalAppRole {
    if (role === UserType.USER) {
      return OneSignalAppRole.USER;
    }
    if ([OperationType.SUPER_ADMIN, OperationType.ADMIN_SUPPORTER].includes(role)) {
      return OneSignalAppRole.ADMIN;
    }
    if ([OperationType.MERCHANT_MANAGER, OperationType.MERCHANT_OPERATOR, OperationType.MERCHANT_SUPPORTER].includes(role)) {
      return OneSignalAppRole.OPERATION;
    }
    return null;
  }
}
