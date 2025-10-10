import { Service } from 'typedi';

import { CronOptions, JobInterface } from '@api/common/schedulers/JobInterface';
import { SharedOrderService } from '@api/order/services/order/SharedOrderService';
import { env } from '@base/env';

@Service()
export default class WipeCancelOrderJob implements JobInterface {
  public cronTime: string;

  public cronOptions: CronOptions;

  constructor(private orderService: SharedOrderService) {
    this.cronTime = env.cronJob.wipeCancelOrder;
    this.cronOptions = {};
  }

  public async execute(): Promise<void> {
    await this.orderService.wipeCancelOrders({
      chunk: 1000,
      timeout: 5000,
    });
  }
}
