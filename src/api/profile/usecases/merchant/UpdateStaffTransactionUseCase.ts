import { Service } from 'typedi';
import { MerchantProfileService } from '@api/profile/services/MerchantProfileService';
import { OperationStatus } from '@api/common/models';
import { Operation } from '@api/profile/models/Operation';
import moment from 'moment';
import { UpdateStaffBodyRequest } from '@api/profile/requests/Merchants/UpdateStaffBodyRequest';
import { events } from '@api/subscribers/events';
import { runOnTransactionCommit, Transactional } from 'typeorm-transactional-cls-hooked';
import { SessionUtil } from '@base/utils/session.util';
import { SocketFactory } from '@api/sockets/SocketFactory';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { SharedPostService } from '@api/post/services/SharedPostService';
import { SharedStatisticService } from '@api/statistic/services/SharedStatisticService';
import { SharedOrderService } from '@api/order/services/order/SharedOrderService';
import {TRANSACTION_DEFAULT_OPTIONS} from '@api/common/constants/TransactionConstant';

@Service()
export class UpdateStaffTransactionUseCase {
  constructor(
    private merchantProfileService: MerchantProfileService,
    private socketFactory: SocketFactory,
    private sharedPostService: SharedPostService,
    private sharedStatisticService: SharedStatisticService,
    private sharedOrderService: SharedOrderService,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {}

  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  public async updateStaffTransactional(staff: Operation, request: UpdateStaffBodyRequest): Promise<void> {
    const payload = {
      ...request,
      activatedAt: this.merchantProfileService.isFirstActive(staff, request.status) ? moment.utc().toDate() : staff.activatedAt,
    };
    await this.merchantProfileService.updateStaff(staff.id, payload);
    if (this.merchantProfileService.isUserWillInactive(staff, payload.status)) {
      runOnTransactionCommit(() =>
        this.destroySessionAndNotify(
          staff,
          payload.status === OperationStatus.BLOCKED ? 'block' : 'inactive'
        )
      );
      if (this.merchantProfileService.isMerchantOperator(staff)) {
        const { total } = await this.sharedPostService.updateOfflinePostOfMerchantOperator(staff.id);
        if (total) {
          await this.sharedStatisticService.updatePostCount(staff.id, false, total);
        }
      }
      if (this.merchantProfileService.isMerchantSupporter(staff)) {
        await this.sharedOrderService.removeSupporterId(staff.id);
      }
    }
    if (this.merchantProfileService.isUserWillActive(staff, payload.status)) {
      this.eventDispatcher.dispatch(
        this.merchantProfileService.isMerchantOperator(staff)
          ? events.actions.operator.activatedFromManager
          : events.actions.supporter.activatedFromManager,
        {
          staff: {...staff, ...payload},
        }
      );
    }
  }

  private destroySessionAndNotify(
    staff: Operation,
    event: 'block' | 'inactive' | 'delete' = 'block'
  ): void {
    const operatorAction =
      event === 'block'
        ? events.actions.user.blocked
        : event === 'inactive'
          ? events.actions.user.deactivated
          : events.actions.user.deleted;
    SessionUtil.destroy(staff.id.toString());
    this.socketFactory.emitToRoom(staff.walletAddress, {
      event: events.objects.user,
      action: operatorAction,
    });
  }
}
