import { Service } from 'typedi';
import { BaseQueueService } from '@api/common/queues/BaseQueueService';
import { QUEUE_NAME } from '@api/common/models/P2PConstant';

@Service()
export class SellOrderLifeCycleQueueService extends BaseQueueService {
  protected readonly QUEUE_NAME = QUEUE_NAME.SELL_ORDER;

  constructor() {
    super();
    this._bullMQService.createQueue(this.QUEUE_NAME, {
      ...this.bullConfig,
      defaultJobOptions: {
        removeOnComplete: {
          count: 1000,
        },
        removeOnFail: {
          count: 5000,
        },
        attempts: this.DEFAULT_ATTEMPTS,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    });
  }
}
