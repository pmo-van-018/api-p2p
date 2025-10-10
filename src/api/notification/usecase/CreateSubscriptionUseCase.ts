import { UserOrOperation } from '@api/profile/types/User';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import redisClient from '@base/utils/redis-client';
import { Service } from 'typedi';
import { NotificationService } from '@api/notification/services/NotificationService';

@Service()
export class CreateSubscriptionUseCase {
  constructor(
    private notificationService: NotificationService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async createSubscriber(requestUser: UserOrOperation, sessionId: string, playerId: string): Promise<boolean> {
    this.log.debug(`Start implement createSubscriber for: ${requestUser.id} and roles: ${requestUser.type}`);
    if (!sessionId || !requestUser) {
      this.log.debug(`Stop implement createSubscriber for: ${requestUser.id} and roles: ${requestUser.type}`);
      return false;
    }

    // Store session ID with Onesignal player_id and Operation's role
    const sessionData = await redisClient.get(`sess:${sessionId}`);
    if (sessionData) {
      // Base on type to store session with corresponding player_id
      const redisKey = this.notificationService.getNotificationRedisKey(requestUser.type);
      const redisNotification = await redisClient.get(redisKey);
      if (redisNotification) {
        const jsonData = this.notificationService.buildWalletData(redisNotification, requestUser.walletAddress, sessionId, playerId);
        await redisClient.set(redisKey, JSON.stringify(jsonData));
        this.log.debug(`Stop implement createSubscriber for: ${requestUser.id} and roles: ${requestUser.type}`);
        return true;
      } else {
        await redisClient.set(
          redisKey,
          JSON.stringify({
            [requestUser.walletAddress]: [{ [sessionId]: playerId }],
          })
        );
        this.log.debug(`Stop implement createSubscriber for: ${requestUser.id} and roles: ${requestUser.type}`);
        return true;
      }
    } else {
      this.log.debug(`Stop implement createSubscriber for: ${requestUser.id} and roles: ${requestUser.type}`);
      return false;
    }
  }
}
