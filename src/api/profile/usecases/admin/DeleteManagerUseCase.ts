import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import {OperationStatus, OperationType} from '@api/common/models';
import {OperationError} from '@api/errors/OperationError';
import {AdminProfileService} from '@api/profile/services/AdminProfileService';
import {SharedOrderService} from '@api/order/services/order/SharedOrderService';
import {deleteCache} from '@base/utils/redis-client';
import {AVATARS_CACHE_KEY} from '@api/profile/services/SharedProfileService';
import {SharedPostService} from '@api/post/services/SharedPostService';
import {SharedStatisticService} from '@api/statistic/services/SharedStatisticService';
import {SocketFactory} from '@api/sockets/SocketFactory';
import {MerchantProfileService} from '@api/profile/services/MerchantProfileService';
import {Operation} from '@api/profile/models/Operation';
import {events} from '@api/subscribers/events';
import {SessionUtil} from '@base/utils/session.util';

@Service()
export class DeleteManagerUseCase {
  constructor(
    private adminProfileService: AdminProfileService,
    private merchantProfileService: MerchantProfileService,
    private sharedOrderService: SharedOrderService,
    private sharedPostService: SharedPostService,
    private sharedStatisticService: SharedStatisticService,
    private socketFactory: SocketFactory,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async deleteManager(managerId: string) {
    this.log.debug(`Start implement deleteManager: ${managerId}`);
    const merchantManager = await this.adminProfileService.findOneById(managerId, OperationType.MERCHANT_MANAGER);
    if (!merchantManager) {
      return OperationError.MERCHANT_NOT_FOUND;
    }
    const order = await this.sharedOrderService.getPendingOrderByOperation(managerId, OperationType.MERCHANT_MANAGER);
    if (order) {
      return OperationError.CANNOT_DISABLE_MANAGER_HAS_PENDING_ORDER;
    }
    const staffs = (
      await this.merchantProfileService.findAllMerchants({
        types: [OperationType.MERCHANT_OPERATOR, OperationType.MERCHANT_SUPPORTER],
        merchantManagerIds: [merchantManager.id],
        status: OperationStatus.ACTIVE,
      })
    ).items;

    await Promise.all(staffs.filter(e => e.type === OperationType.MERCHANT_OPERATOR).map(operator => {
      return async () => {
        const { total } = await this.sharedPostService.updateOfflinePostOfMerchantOperator(operator.id);
        if (total) {
          await this.sharedStatisticService.updatePostCount(operator.id, false, total);
        }
      };
    }));
    await this.adminProfileService.softDeleteOperation(merchantManager.id);
    await this.adminProfileService.softDeleteManagerStaff(merchantManager.id);
    await deleteCache(AVATARS_CACHE_KEY);
    this.destroySessionAndNotifyEvent([merchantManager, ...staffs]);

    this.log.debug(`Stop implement deleteManager: ${managerId}`);
    return null;
  }

  private destroySessionAndNotifyEvent(operators: Operation[]) {
    operators.forEach((operator) => {
      // force logout blocked operator
      SessionUtil.destroy(operator.id.toString());
      // notify event to deacvivated operator
      this.socketFactory.emitToRoom(operator.walletAddress, {
        event: events.objects.user,
        action: events.actions.user.deleted,
      });
    });
  }
}
