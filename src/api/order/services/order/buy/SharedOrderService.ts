import { SharedOrderService } from '@api/order/services/order/SharedOrderService';
import { TradeType } from '@api/common/models';
import { BUY_ORDER_STEPS, Order, OrderStatus } from '@api/order/models/Order';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { OrderRepository } from '@api/order/repositories/OrderRepository';
import moment from 'moment';
import { Logger, LoggerInterface } from '@base/decorators/Logger';

export class SharedBuyOrderService extends SharedOrderService {
  constructor(
    @InjectRepository() protected orderRepository: OrderRepository,
    @Logger(__filename) protected log: LoggerInterface
  ) {
    super(orderRepository, log);
  }
  public async getBuyOrderByRefIdWithLock(refId: string): Promise<Order | null> {
    return await this.orderRepository.getOrderByRefIdWithLock(refId, TradeType.BUY);
  }

  public async updateBuyOrderToAppealStep(orderId: string, currentStep: BUY_ORDER_STEPS) {
    const updatedStep =
      currentStep === BUY_ORDER_STEPS.BUY_ENABLE_APPEAL_WHILE_CONFIRMING_FIAT_BY_MERCHANT
        ? BUY_ORDER_STEPS.BUY_APPEAL_SENT_WHILE_CONFIRMING_FIAT_BY_MERCHANT
        : BUY_ORDER_STEPS.BUY_APPEAL_SENT_SENDING_CRYPTO_FAILED;
    await this.orderRepository.update(orderId, {
      step: updatedStep,
    });
    return updatedStep;
  }

  public async cancelOrderByAdmin(id: string, operationId: string): Promise<void> {
    await this.orderRepository.update(id, {
      status: OrderStatus.CANCELLED,
      cancelByOperationId: operationId,
      step: BUY_ORDER_STEPS.BUY_ORDER_CANCELLED_BY_SYSTEM,
      completedTime: moment.utc().toDate(),
      paymentMethodId: null,
    });
  }

  public async setTotalPenaltyFee(id: string, totalPenaltyFee: number) {
    await this.orderRepository.update(id, {
      totalPenaltyFee,
    });
  }

  public async reopenByAdmin(id: string, payload: Pick<Order, 'amount' | 'totalPrice' | 'status' | 'step'>) {
    await this.orderRepository.update(id, payload);
  }
}
