import {Logger, LoggerInterface} from '@base/decorators/Logger';
import {Service} from 'typedi';
import {OrderLifeCycleError} from '@api/order/errors/OrderLifeCycleError';
import {Operation} from '@api/profile/models/Operation';
import {MerchantOrderLifecycleService} from '@api/order/services/order/MerchantOrderLifecycleService';
import {BUY_ORDER_STEPS, Order, OrderStatus} from '@api/order/models/Order';
import {sendSystemNotification} from '@base/utils/chat-notification.utils';
import {events} from '@api/subscribers/events';
import {SharedAppealService} from '@api/appeal/services/SharedAppealService';
import {SharedStatisticService} from '@api/statistic/services/SharedStatisticService';
import {EventDispatcher, EventDispatcherInterface} from '@base/decorators/EventDispatcher';
import {TradeType} from '@api/common/models';
import {TransactionStatus} from '@api/order/models/CryptoTransaction';
import {CryptoTransactionError} from '@api/order/errors/CryptoTransactionError';
import {P2PError} from '@api/common/errors/P2PError';
import {Transactional} from 'typeorm-transactional-cls-hooked';
import {CryptoTransactionService} from '@api/order/services/CryptoTransactionService';
import {SubmitCryptoTransactionRequest} from '@api/order/requests/SubmitCryptoTransactionRequest';
import {TRANSACTION_DEFAULT_OPTIONS} from '@api/common/constants/TransactionConstant';

@Service()
export class SubmitCryptoTransactionUseCase {
  constructor(
    private merchantOrderService: MerchantOrderLifecycleService,
    private cryptoTransactionService: CryptoTransactionService,
    private sharedAppealService: SharedAppealService,
    private sharedStatisticService: SharedStatisticService,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async submitCryptoTransaction(
    currentUser: Operation,
    orderCryptoTransactionRequest: SubmitCryptoTransactionRequest
  ) {
    this.log.debug('Start implement submitCryptoTransaction method for: ', currentUser.type, currentUser.walletAddress);
    const order = await this.merchantOrderService.getFullInfoByRefId(orderCryptoTransactionRequest.orderId);
    if (!order || order.merchantId !== currentUser.id) {
      return OrderLifeCycleError.ORDER_NOT_FOUND;
    }
    if (order.type !== TradeType.BUY) {
      return OrderLifeCycleError.ORDER_TYPE_IS_INVALID;
    }
    if (order.isStatusNotEqual(OrderStatus.PAID)) {
      throw new P2PError(OrderLifeCycleError.ORDER_STATUS_IS_INVALID);
    }

    const hashExistErrorType = orderCryptoTransactionRequest.isUpdate
      ? CryptoTransactionError.TX_HASH_ALREADY_EXISTS
      : CryptoTransactionError.CRYPTO_TRANSACTION_ALREADY_EXISTS;

    const cryptoInfo = await this.cryptoTransactionService.findOneWithConditions({
      hash: orderCryptoTransactionRequest.hash,
    });

    const isDifferentOrder = cryptoInfo?.orderId !== order.id;
    const isPendingTransaction = cryptoInfo?.status === TransactionStatus.PENDING;
    const isTransactionExisted = cryptoInfo && (isPendingTransaction || isDifferentOrder);

    if (isTransactionExisted) {
      return hashExistErrorType;
    }

    const updatedData = await this.submitCryptoTransactional(order, orderCryptoTransactionRequest);

    this.log.debug('[submitCryptoTransaction] sending notification ', currentUser.type, currentUser.walletAddress);
    await sendSystemNotification(updatedData.updatedOrder);

    this.eventDispatcher.dispatch(events.actions.order.buy.merchantSubmitTransaction, {
      order: updatedData.updatedOrder,
      cryptoTransaction: updatedData.cryptoTransaction,
    });
    this.log.debug('Stop implement submitCryptoTransaction method for: ', currentUser.type, currentUser.walletAddress);

    return {
      transaction: updatedData.cryptoTransaction,
      orderStep: updatedData.updatedOrder.step,
      orderType: updatedData.updatedOrder.type,
    };
  }

  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  private async submitCryptoTransactional(
    order: Order,
    orderCryptoTransactionRequest: SubmitCryptoTransactionRequest
  ) {
    this.log.debug('Start implement submitCryptoTransactional method for: ', order.id);
    const payload = {
      status: OrderStatus.PAID,
      step: BUY_ORDER_STEPS.BUY_SENDING_CRYPTO_BY_MERCHANT,
    };
    await this.merchantOrderService.update(order.id, payload);

    this.log.debug('[submitCryptoTransactional] submitCryptoTransaction for: ', order.id);
    const cryptoTransaction = await this.cryptoTransactionService.submitCryptoTransaction(
      order.id,
      orderCryptoTransactionRequest.hash,
      order.asset.network
    );
    if (order.appealId) {
      await this.sharedAppealService.pending(order.appealId);
    }

    this.log.debug('[submitCryptoTransactional] updateOrderStatistic for: ', order.id);
    await this.sharedStatisticService.updateOrderStatistic(order, BUY_ORDER_STEPS.BUY_SENDING_CRYPTO_BY_MERCHANT);
    const updatedOrder = await this.merchantOrderService.getFullInfoByRefId(order.refId);
    return {
      updatedOrder,
      cryptoTransaction,
    };
  }
}
