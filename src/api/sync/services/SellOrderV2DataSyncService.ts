import { CompletedOrderEventV2, OrderEventType } from '@api/order/models/OrderEvent';
import { OrderRepository } from '@api/order/repositories/OrderRepository';
import { BaseSyncService } from '@api/sync/services/BaseSyncService';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { env } from '@base/env';
import { EventEmitter } from '@base/queues/EventEmitter';
import { KafkaEventEmitter } from '@base/queues/kafka/KafkaEventEmitter';
import { Inject, Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { v4 } from 'uuid';
import { chunk } from 'lodash';

@Service()
export class SellOrderV2DataSyncService extends BaseSyncService {
  constructor(
    @InjectRepository() protected orderRepository: OrderRepository,
    @Logger(__filename) protected log: LoggerInterface,
    @Inject(() => KafkaEventEmitter) protected eventEmitter: EventEmitter
  ) {
    super();
  }

  async sync(): Promise<void> {
    const orders = await this.orderRepository.getCompletedSellOrdersFromTimeRange(
      env.resync.fromTime,
      env.resync.toTime
    );

    if (!orders.length) {
      this.log.info('No completed sell orders to sync');
      return;
    }

    this.log.info(`Syncing ${orders.length} completed sell orders to Kafka`);
    const batches = chunk(orders, 100);
    this.log.info(`Separating orders into ${batches.length} batches`);
    this.log.info('Starting sync');
    for (const [index, batch] of batches.entries()) {
      const orderEvents = batch.map((order) => new CompletedOrderEventV2(order));
      const events = orderEvents.map((orderEvent) => ({
        topic: env.kafka.orders.topics.v2,
        key: v4(),
        value: JSON.stringify(orderEvent),
        headers: {
          'event-type': OrderEventType.ORDER_COMPLETED,
        },
      }));
      await this.eventEmitter.batchEmit(events);
      this.log.info(`Batch ${index + 1} synced`);
    }

    this.log.info('Sync completed');
  }
}
