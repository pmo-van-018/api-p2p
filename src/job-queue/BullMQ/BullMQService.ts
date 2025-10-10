import { JobsOptions, Processor, Queue, QueueOptions, Worker, WorkerOptions } from 'bullmq';
import { env } from '@base/env';

export class BullMQService {
  private _queue: Queue;
  private _worker: Worker;
  private readonly _prefix: string;

  constructor() {
    process.on('SIGTERM', async () => {
      await this._worker.close();
    });
    process.on('SIGINT', async () => {
      await this._worker.close();
    });
    this._prefix = env.app.cacheEnv;
  }

  public get worker() {
    return this._worker;
  }

  public get queue() {
    return this._queue;
  }

  public createQueue(name: string, config: QueueOptions) {
    this._queue = new Queue(this.genProcessName(name), {
      ...config,
    });

    return this._queue;
  }

  public createWorker(name: string, processor?: string | Processor<any, any, any>, options?: WorkerOptions) {
    this._worker = new Worker(this.genProcessName(name), processor, {
      ...options,
    });

    return this._worker;
  }

  public add<T>(id: string, data: T, options: JobsOptions = {}) {
    this._queue.add(id, data, {
      ...options,
    });
  }

  private genProcessName (name: string) {
    return this._prefix + name;
  }
}
