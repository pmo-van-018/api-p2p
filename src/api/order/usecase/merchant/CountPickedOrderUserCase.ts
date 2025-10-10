import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import {Operation} from '@api/profile/models/Operation';
import {MerchantOrderManagementService} from '@api/order/services/order/MerchantOrderManagementService';

@Service()
export class CountPickedOrderUserCase {
  constructor(
    private merchantOrderManagementService: MerchantOrderManagementService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async countPicked(currentUser: Operation) {
    this.log.debug('Start implement CountPickedOrderUserCase method for: ', currentUser.type, currentUser.walletAddress);
    const pickedOrderNumber = await this.merchantOrderManagementService.countPickedOrder(currentUser.id);
    this.log.debug('Stop implement CountPickedOrderUserCase method for: ', currentUser.type, currentUser.walletAddress);
    return pickedOrderNumber;
  }
}
