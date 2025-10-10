import { Service } from 'typedi';

import { Order, OrderStatus } from '@api/order/models/Order';
import { CompletedOrderEventV2, OrderEventType } from '@api/order/models/OrderEvent';
import { OutBox } from '@api/outbox/models/OutBox';
import { OutBoxService } from '@api/outbox/services/OutBoxService';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { env } from '@base/env';

@Service()
export class OrderOutBoxService {
  constructor(@Logger(__filename) protected log: LoggerInterface, private readonly outBoxService: OutBoxService) {}

  public async publishCompletedOrderEvent(order: Order) {
    if (order.status === OrderStatus.COMPLETED) {
      this.log.info(`Start implement for publishCompletedOrderEvent for order ${order.refId}`);
      const orderEvent = new CompletedOrderEventV2(order);
      const outbox = OutBox.create({
        topic: env.kafka.orders.topics.v1,
        eventType: OrderEventType.ORDER_COMPLETED,
        aggregateId: orderEvent.orderId,
        payload: JSON.stringify(orderEvent),
      });
      await this.outBoxService.saveOutbox(outbox);
      this.log.info(`Stop implement for publishCompletedOrderEvent for order ${order.refId}`);
    }
  }
}
