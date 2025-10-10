import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import { UserOrderLifecycleService } from '@api/order/services/order/UserOrderLifecycleService';
import { Operation } from '@api/profile/models/Operation';

@Service()
export class CountTransactionConfirmationUseCase {
  constructor(
    private userOrderService: UserOrderLifecycleService,
    @Logger(__filename) private log: LoggerInterface
  ) {}
  
  public async countTransaction(currentUser: Operation): Promise<number>{
    this.log.debug('Start implement CountTransactionConfirmationUseCase countTransaction for: ', currentUser.type, currentUser.walletAddress);
    const total = await this.userOrderService.countTotalTransactionConfirmation();
    this.log.debug('End implement CountTransactionConfirmationUseCase countTransaction for: ', currentUser.type, currentUser.walletAddress);
    return total;
  }
}
