import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import { OrderLifeCycleError } from '@api/order/errors/OrderLifeCycleError';
import { UserOrderLifecycleService } from '@api/order/services/order/UserOrderLifecycleService';
import { ConfirmationTransactionResult } from '@api/common/models';
import { CryptoTransactionService } from '@api/order/services/CryptoTransactionService';
import { CryptoTransaction, TransactionStatus } from '@api/order/models/CryptoTransaction';
import { Operation } from '@api/profile/models/Operation';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { TRANSACTION_DEFAULT_OPTIONS } from '@api/common/constants/TransactionConstant';
import { AdminSupporterConfirmTransactionRequest } from '@api/order/requests/AdminSupporterConfirmTransactionRequest';
import { SystemSellOrderLifecycleService } from '@api/order/services/order/sell/SystemOrderLifecycleService';
import { ServiceResult } from '@api/infrastructure/helpers/ServiceResult';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { events } from '@api/subscribers/events';

@Service()
export class ConfirmTransactionUseCase {
  constructor(
    private userOrderService: UserOrderLifecycleService,
    private cryptoTransactionService: CryptoTransactionService,
    private systemSellOrderLifecycleService: SystemSellOrderLifecycleService,
    @Logger(__filename) private log: LoggerInterface,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
  ) {}
  
  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  public async confirmTransaction(currentUser: Operation, adminSupporterConfirmTransactionRequest: AdminSupporterConfirmTransactionRequest): Promise<OrderLifeCycleError | void>{
    this.log.debug('Start implement confirmTransaction for: ', currentUser.type, currentUser.walletAddress);
    const { id, result } = adminSupporterConfirmTransactionRequest;
    const order = await this.userOrderService.getFullSellOrdeByRefId(id);
    if (!order) {
      return OrderLifeCycleError.ORDER_NOT_FOUND;
    }
    if (order.confirmHashBySupporterId) { 
      return OrderLifeCycleError.ORDER_HAS_CONFIRMED;
    }
    const error = this.userOrderService.validateOrderBeforeConfirmTransaction(order, currentUser);
    if (error) {
      return error;
    }
    const transactionFailed = await this.cryptoTransactionService.findOneWithConditions(
      {
        orderId: order.id,
        status: TransactionStatus.UNKNOWN,
      },
      {
        order: {
          createdAt: 'DESC',
        },
      }
    );
    if (!transactionFailed) {
      return OrderLifeCycleError.TRANSACTION_STATUS_INVALID;
    }
    let cryptoTransactionResult: ServiceResult<CryptoTransaction> = null;
    if (result === ConfirmationTransactionResult.SUCCESS) {
      transactionFailed.status = TransactionStatus.SUCCEED;
      cryptoTransactionResult = await this.systemSellOrderLifecycleService.updateTransactionStatus(transactionFailed);
    } else {
      transactionFailed.status = TransactionStatus.FAILED;
      cryptoTransactionResult = await this.systemSellOrderLifecycleService.updateTransactionStatus(transactionFailed, true);
      this.eventDispatcher.dispatch(events.actions.order.sell.cancelOrderByAdminSupporter, order);
    }
    await this.userOrderService.update(order.id, { confirmHashBySupporterId: currentUser.id });
    this.log.debug('End implement confirmTransaction for: ', currentUser.type, currentUser.walletAddress);
    return cryptoTransactionResult.errors?.length ? cryptoTransactionResult.errors[0] : null;
  }
}
