import { CompletedOrderEventV2, OrderEventType } from '@api/order/models/OrderEvent';
import { OrderRepository } from '@api/order/repositories/OrderRepository';
import { OutBox } from '@api/outbox/models/OutBox';
import { OutBoxService } from '@api/outbox/services/OutBoxService';
import { BaseSyncService } from '@api/sync/services/BaseSyncService';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { env } from '@base/env';
import { EventEmitter } from '@base/queues/EventEmitter';
import { KafkaEventEmitter } from '@base/queues/kafka/KafkaEventEmitter';
import { Inject, Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export class OrderOutBoxSyncService extends BaseSyncService {
  constructor(
    private readonly outBoxService: OutBoxService,
    @InjectRepository() protected orderRepository: OrderRepository,
    @Logger(__filename) protected log: LoggerInterface,
    @Inject(() => KafkaEventEmitter) protected eventEmitter: EventEmitter
  ) {
    super();
  }

  async sync(): Promise<void> {
    const orders = await this.orderRepository.getUnPublishedCompletedOrdersFromTimeRange(
      env.kafka.orders.backfill.v1.fromTime,
      env.kafka.orders.backfill.v1.toTime,
      env.kafka.orders.backfill.v1.limit
    );

    if (orders.length) {
      this.log.info(`Found ${orders.length} missing orders to sync`);

      const outboxes = orders.map((order) => {
        this.log.info(`Create Outbox record for Order: ${order?.refId}`);
        const orderEvent = new CompletedOrderEventV2(order);
        const outbox = OutBox.create({
          topic: env.kafka.orders.topics.v1,
          eventType: OrderEventType.ORDER_COMPLETED,
          aggregateId: orderEvent.orderId,
          payload: JSON.stringify(orderEvent),
        });
        return outbox;
      });

      await this.outBoxService.saveOutboxes(outboxes);
      this.log.info(`Inserting ${outboxes.length} missing orders to sync`);
    }

    this.log.info('Publishing events to kafka');
    await this.outBoxService.publish();
    this.log.info('Events published to kafka. Sync completed');
  }
}
