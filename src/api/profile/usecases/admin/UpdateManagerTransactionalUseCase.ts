import {Service} from 'typedi';
import {MerchantProfileService} from '@api/profile/services/MerchantProfileService';
import {OperationStatus, OperationType} from '@api/common/models';
import {AdminProfileService} from '@api/profile/services/AdminProfileService';
import {runOnTransactionCommit, Transactional} from 'typeorm-transactional-cls-hooked';
import {Operation} from '@api/profile/models/Operation';
import {EntityBase} from '@api/infrastructure/abstracts/EntityBase';
import {events} from '@api/subscribers/events';
import {TRANSACTION_DEFAULT_OPTIONS} from '@api/common/constants/TransactionConstant';
import {SessionUtil} from '@base/utils/session.util';
import {SocketFactory} from '@api/sockets/SocketFactory';
import {EventDispatcher, EventDispatcherInterface} from '@base/decorators/EventDispatcher';
import {SharedPostService} from '@api/post/services/SharedPostService';
import {SharedStatisticService} from '@api/statistic/services/SharedStatisticService';
import {Logger, LoggerInterface} from '@base/decorators/Logger';

@Service()
export class UpdateManagerTransactionalUseCase {
  constructor(
    private adminProfileService: AdminProfileService,
    private merchantProfileService: MerchantProfileService,
    private sharedPostService: SharedPostService,
    private sharedStatisticService: SharedStatisticService,
    private socketFactory: SocketFactory,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  public async updateMerchantManagerTransactional(
    merchantManager: Operation,
    payload: Partial<Omit<Operation, keyof EntityBase | 'id'>> & {}
  ): Promise<void> {
    this.log.debug(`Start implement updateMerchantManagerTransactional: ${merchantManager.id} with params: ${JSON.stringify(payload)}`);
    await this.merchantProfileService.updateStaff(merchantManager.id, payload);
    if (payload.contractFrom || payload.contractTo) {
      // update contract of all the merchant operator
      await this.merchantProfileService.updateManagerStaffs(merchantManager.id, payload);
    }
    if (this.merchantProfileService.isUserWillInactive(merchantManager, payload.status)) {
      runOnTransactionCommit(() =>
        this.destroySessionAndNotifyEvent(
          [...staffs, merchantManager],
          payload.status === OperationStatus.BLOCKED ? 'block' : 'inactive'
        )
      );
      const staffs = (
        await this.merchantProfileService.findAllMerchants({
          types: [OperationType.MERCHANT_OPERATOR, OperationType.MERCHANT_SUPPORTER],
          merchantManagerIds: [merchantManager.id],
          status: OperationStatus.ACTIVE,
        })
      ).items;
      await this.adminProfileService.updateOperationsStatus(
        [merchantManager.id, ...staffs.map(e => e.id)],
        payload.status
      );
      await Promise.all(staffs.filter(e => e.type === OperationType.MERCHANT_OPERATOR).map(async operator => {
        const { total } = await this.sharedPostService.updateOfflinePostOfMerchantOperator(operator.id);
        if (total) {
          await this.sharedStatisticService.updatePostCount(operator.id, false, total);
        }
      }));
    }
    if (this.merchantProfileService.isUserWillActive(merchantManager, payload.status)) {
      runOnTransactionCommit(() => this.eventDispatcher.dispatch(events.actions.user.activeManager, merchantManager));
      const staffs = (
        await this.merchantProfileService.findAllMerchants({
          types: [OperationType.MERCHANT_OPERATOR, OperationType.MERCHANT_SUPPORTER],
          merchantManagerIds: [merchantManager.id],
          status: [OperationStatus.INACTIVE],
        })
      ).items;
      await this.adminProfileService.updateOperationsStatus(
        [merchantManager.id, ...staffs.map(e => e.id)],
        OperationStatus.ACTIVE
      );
      merchantManager.merchantOperators = staffs;
    }
    this.log.debug(`Stop implement updateMerchantManagerTransactional: ${merchantManager.id} with params: ${JSON.stringify(payload)}`);
  }

  private destroySessionAndNotifyEvent(
    operations: Operation[],
    event: string
  ): void {
    const operatorAction =
      event === 'block'
        ? events.actions.user.blocked
        : event === 'inactive'
          ? events.actions.user.deactivated
          : events.actions.user.deleted;
    operations.forEach((operation) => {
      // force logout blocked operator
      SessionUtil.destroy(operation.id.toString());
      this.socketFactory.emitToRoom(operation.walletAddress, {
        event: events.objects.user,
        action: operatorAction,
      });
    });
  }
}
