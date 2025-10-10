import { env } from '@base/env';

export class WorkerConfig {
  get runOrderInterval(): number {
    return Number(env.worker.orderIntervalLimit);
  }

  get runCryptoTransactionInterval(): number {
    return Number(env.worker.transactionIntervalLimit);
  }
}
