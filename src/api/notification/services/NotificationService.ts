import {
  NotificationStatus,
  OperationType,
  ROLE_TYPE,
  UserType,
} from '@api/common/models/P2PEnum';
import { NotificationRepository } from '@api/notification/repositories/NotificationRepository';
import { NotificationUserRepository } from '@api/notification/repositories/NotificationUserRepository';
import { NotificationListRequest } from '@api/notification/requests/NotificationListRequest';
import { Member } from '@api/profile/types/User';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';

const NOTIFICATION_PREFIX = 'notification';

@Service()
export class NotificationService {
  constructor(
    @InjectRepository() private notificationRepository: NotificationRepository,
    @InjectRepository() private notificationUserRepository: NotificationUserRepository,
  ) {}

  public buildWalletData(redisData: any, walletAddress: string, sessionId: string, playerId: string) {
    const jsonData = JSON.parse(redisData);
    const walletSessions = jsonData[walletAddress];
    if (walletSessions) {
      const existingSession = (walletSessions || []).find((item) => item[sessionId] === playerId);
      if (!existingSession) {
        jsonData[walletAddress].push({
          [sessionId]: playerId,
        });
      }
    } else {
      jsonData[walletAddress] = [{ [sessionId]: playerId }];
    }

    return jsonData;
  }

  public getNotificationRedisKey(role: UserType | OperationType) {
    return `${NOTIFICATION_PREFIX}_${role || ROLE_TYPE.USER}`;
  }

  public async getNotificationListByUserId (user: Member, notificationListRequest: NotificationListRequest) {
    return await this.notificationRepository.getNotificationListByUserId({
      ...notificationListRequest,
      ...(user.type === UserType.USER && { userId: user.id }),
      ...(user.type !== UserType.USER && { operationId: user.id }),
    });
  }
  public async countNotificationByType (user: Member) {
    return await this.notificationRepository.countNotificationByType({
      ...(user.type === UserType.USER && { userId: user.id }),
      ...(user.type !== UserType.USER && { operationId: user.id }),
    });
  }
  public async getNotificationById(notificationId: string, user: Member) {
    return await this.notificationRepository.getNotificationById({
      notificationId,
      ...(user.type === UserType.USER && { userId: user.id }),
      ...(user.type !== UserType.USER && { operationId: user.id }),
    });
  }
  public async updateStatus(notificationId: string, user: Member, status: NotificationStatus) {
    return await this.notificationUserRepository.update(
      {
        notificationId,
        ...(user.type === UserType.USER ? { userId: user.id } : { operationId: user.id }),
      },
      { status }
    );
  }
  public async updateStatusAll(user: Member, status: NotificationStatus) {
    return await this.notificationUserRepository.update(
      user.type === UserType.USER ? { userId: user.id } : { operationId: user.id },
      { status }
    );
  }
  public async deleteAllNotificationUser(currentUser: Member) {
    const whereCondition = currentUser.type === UserType.USER ? { userId: currentUser.id } : { operationId: currentUser.id };
    return await this.notificationUserRepository.delete(whereCondition);
  }
}
