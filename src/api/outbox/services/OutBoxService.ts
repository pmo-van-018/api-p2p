import { TRANSACTION_DEFAULT_OPTIONS } from '@api/common/constants/TransactionConstant';
import { OutBox } from '@api/outbox/models/OutBox';
import { OutBoxRepository } from '@api/outbox/repositories/outbox.repository';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { EventEmitter } from '@base/queues/EventEmitter';
import { KafkaEventEmitter } from '@base/queues/kafka/KafkaEventEmitter';
import { chunk } from 'lodash';
import { Inject, Service } from 'typedi';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export class OutBoxService {
  constructor(
    @InjectRepository() private readonly outBoxRepository: OutBoxRepository,
    @Inject(() => KafkaEventEmitter)
    private readonly eventEmitter: EventEmitter,
    @Logger(__filename) protected log: LoggerInterface
  ) {}

  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  public async publish(limit?: number): Promise<void> {
    this.log.info(`Start implementing publish outbox messages`);
    const outboxes = await this.outBoxRepository.fetchMessages(limit);
    this.log.info(`Found ${outboxes.length} outbox messages to publish`);

    if (!outboxes.length) {
      this.log.info('No outbox messages to publish. Stop implementing publish outbox messages');
      return;
    }

    const batches = chunk(outboxes, 50);
    this.log.info(`Separating outbox messages into ${batches.length} batches`);
    this.log.info('Starting publish');
    for (const [index, batch] of batches.entries()) {
      const events = batch.map((outbox: any) => ({
        topic: outbox.topic,
        key: outbox.id,
        value: outbox.payload,
        headers: {
          ...(outbox.event_type && { 'event-type': outbox.event_type }),
        },
      }));

      try {
        await this.eventEmitter.batchEmit(events);
        await this.outBoxRepository.markAsSent(batch as any);
        this.log.info(`Batch ${index + 1} published`);
      } catch (error) {
        this.log.error('Error publishing outbox messages', error);
        throw error;
      }
    }

    this.log.info('Publish completed. Stop implementing publish outbox messages');
  }

  public async saveOutbox(outbox: OutBox) {
    return this.outBoxRepository.save(outbox);
  }

  public async saveOutboxes(outboxes: OutBox[]) {
    return this.outBoxRepository.save(outboxes);
  }
}
