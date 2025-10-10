import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import { User } from '@api/profile/models/User';
import { OrderLifeCycleError } from '@api/order/errors/OrderLifeCycleError';
import { UserOrderLifecycleService } from '@api/order/services/order/UserOrderLifecycleService';
import { Order, OrderStatus, SELL_ORDER_STEP } from '@api/order/models/Order';
import { events} from '@api/subscribers/events';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { SharedPostService } from '@api/post/services/SharedPostService';
import { SharedStatisticService } from '@api/statistic/services/SharedStatisticService';
import { RedlockUtil } from '@base/utils/redlock';
import { CryptoTransactionError } from '@api/order/errors/CryptoTransactionError';
import { CryptoTransaction, TransactionStatus } from '@api/order/models/CryptoTransaction';
import { CryptoTransactionService } from '@api/order/services/CryptoTransactionService';
import { SubmitCryptoTransactionRequest } from '@api/order/requests/SubmitCryptoTransactionRequest';
import {TRANSACTION_DEFAULT_OPTIONS} from '@api/common/constants/TransactionConstant';

@Service()
export class SubmitCryptoTransactionUseCase {
  constructor(
    private userOrderService: UserOrderLifecycleService,
    private cryptoTransactionService: CryptoTransactionService,
    private sharedPostService: SharedPostService,
    private sharedStatisticService: SharedStatisticService,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async submit(currentUser: User, orderCryptoTransactionRequest: SubmitCryptoTransactionRequest) {
    this.log.debug('Start implement SubmitCryptoTransactionUseCase for: ', currentUser.id);
    const order = await this.userOrderService.getFullInfoByRefId(orderCryptoTransactionRequest.orderId);
    if (!order || order.userId !== currentUser.id) {
      return OrderLifeCycleError.ORDER_NOT_FOUND;
    }
    if (order.isStatusNotEqual(OrderStatus.TO_BE_PAID)) {
      return OrderLifeCycleError.ORDER_STATUS_IS_INVALID;
    }

    if (order.isStatusEqual(OrderStatus.TO_BE_PAID) && order.isExpiredEndTime()) {
      return OrderLifeCycleError.CRYPTO_PAYMENT_TIME_IS_EXPIRED;
    }

    const hashExistError = orderCryptoTransactionRequest.isUpdate
      ? CryptoTransactionError.TX_HASH_ALREADY_EXISTS
      : CryptoTransactionError.CRYPTO_TRANSACTION_ALREADY_EXISTS;
    const cryptoInfo = await this.cryptoTransactionService.findOneWithConditions({
      hash: orderCryptoTransactionRequest.hash,
    });

    const isDifferentOrder = cryptoInfo?.orderId !== order.id;
    const isPendingTransaction = cryptoInfo?.status === TransactionStatus.PENDING;
    const isTransactionExisted = cryptoInfo && (isPendingTransaction || isDifferentOrder);

    if (isTransactionExisted) {
      return hashExistError;
    }

    return await RedlockUtil.lock(this.sharedPostService.getKeyPostLock(order.postId), async () => {
      this.log.debug('[submitCryptoTransaction] handle logic in lock', currentUser.type, currentUser.walletAddress);

      const cryptoTransaction = await this.submitCryptoTransactional(order, orderCryptoTransactionRequest);

      const updatedOrder = await this.userOrderService.getFullInfoByRefId(orderCryptoTransactionRequest.orderId);

      this.eventDispatcher.dispatch(events.actions.order.sell.userSubmitTransaction, {
        order: updatedOrder,
        cryptoTransaction,
      });

      this.log.debug('Stop implement SubmitCryptoTransactionUseCase for: ', currentUser.id);

      return {
        transaction: cryptoTransaction,
        orderStep: updatedOrder.step,
        orderType: updatedOrder.type,
      };
    });
  }

  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  private async submitCryptoTransactional(
    order: Order,
    orderCryptoTransactionRequest: SubmitCryptoTransactionRequest
  ): Promise<CryptoTransaction> {
    this.log.debug('Start implement submitCryptoTransactional method for: ', order.id);
    await this.userOrderService.update(order.id, {
      status: OrderStatus.TO_BE_PAID,
      step: SELL_ORDER_STEP.SELL_SENDING_CRYPTO_BY_USER,
    });
    await this.sharedStatisticService.updateOrderStatistic(order, SELL_ORDER_STEP.SELL_SENDING_CRYPTO_BY_USER);
    return await this.cryptoTransactionService.submitCryptoTransaction(
      order.id,
      orderCryptoTransactionRequest.hash,
      order.asset.network
    );
  }
}
