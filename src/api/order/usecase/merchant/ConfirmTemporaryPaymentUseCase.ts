import {Logger, LoggerInterface} from '@base/decorators/Logger';
import {Service} from 'typedi';
import {OrderLifeCycleError} from '@api/order/errors/OrderLifeCycleError';
import {Operation} from '@api/profile/models/Operation';
import {OrderStatus} from '@api/order/models/Order';
import {RedlockUtil} from '@base/utils/redlock';
import {SharedPostService} from '@api/post/services/SharedPostService';
import {Transactional} from 'typeorm-transactional-cls-hooked';
import {TRANSACTION_DEFAULT_OPTIONS} from '@api/common/constants/TransactionConstant';
import { ConfirmSentFiatRequest } from '@api/order/requests/ConfirmSentFiatRequest';
import { SharedSellOrderService } from '@api/order/services/order/sell/SharedOrderService';

@Service()
export class ConfirmTemporaryPaymentUseCase {
  constructor(
    private sharedPostService: SharedPostService,
    private sharedSellOrderService: SharedSellOrderService,
    @Logger(__filename) private log: LoggerInterface
  ) { }

  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  public async confirmTemporaryPayment(currentUser: Operation, body: ConfirmSentFiatRequest) {
    const { id, paymentMethodId } = body;
    this.log.debug('Start implement confirmTemporaryPayment method for: ', currentUser.type, currentUser.walletAddress);
    const order = await this.sharedSellOrderService.getFullInfoByRefId(id);

    if (!order || order.merchantId !== currentUser.id) {
      return OrderLifeCycleError.ORDER_NOT_FOUND;
    }
    if (order.isStatusNotEqual(OrderStatus.PAID)) {
      return OrderLifeCycleError.ORDER_STATUS_IS_INVALID;
    }
    const isTicketProcessing = await this.sharedSellOrderService.checkPaymentTicketProcessing(order.id);
    if (isTicketProcessing) {
      return OrderLifeCycleError.PAYMENT_TICKET_IS_EXIST;
    }
    return await RedlockUtil.lock(this.sharedPostService.getKeyPostLock(order.postId), async () => {
      await this.sharedSellOrderService.confirmSentTransaction(order, paymentMethodId, true);
      this.log.debug('Stop implement confirmTemporaryPayment method for: ', currentUser.type, currentUser.walletAddress);
    });
  }
}
