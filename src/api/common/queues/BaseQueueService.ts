import { QueueBaseOptions } from 'bullmq';
import { env } from '@base/env';
import { BullMQService } from '@base/job-queue/BullMQ/BullMQService';

export class BaseQueueService {
  protected DEFAULT_ATTEMPTS = 3;
  protected QUEUE_NAME = 'base-queue';

  protected bullConfig: QueueBaseOptions = {
    connection: {
      host: env.redis.host,
      port: env.redis.port,
      connectTimeout: 50000,
      keepAlive: 30000,
    },
  };

  protected _bullMQService: BullMQService;

  public get bullMQService(): BullMQService {
    return this._bullMQService;
  }

  constructor() {
    this._bullMQService = new BullMQService();
  }

  public add<T>(id: string, data: T) {
    this._bullMQService.add(id, data);
  }
}
