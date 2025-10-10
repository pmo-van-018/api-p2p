import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import {ActiveWalletAddressByAdminRequest} from '@api/profile/requests/ActiveWalletAddressByAdminRequest';
import {events} from '@api/subscribers/events';
import { ActiveWalletAddressUseCase as ActiveManagerWalletAddressUseCase} from '@api/profile/usecases/merchant/ActiveWalletAddressUseCase';
import {OperationType} from '@api/common/models';
import {OperationError} from '@api/errors/OperationError';
import {AdminProfileService} from '@api/profile/services/AdminProfileService';
import {WalletAddressManagementService} from '@api/profile/services/WalletAddressManagementService';
import {EventDispatcher, EventDispatcherInterface} from '@base/decorators/EventDispatcher';
import {OperationWalletError} from '@api/profile/errors/OperationWallet';
import {SharedOrderService} from '@api/order/services/order/SharedOrderService';

@Service()
export class ActiveWalletAddressUseCase {
  constructor(
    private adminProfileService: AdminProfileService,
    private sharedOrderService: SharedOrderService,
    private activeManagerWalletAddressUseCase: ActiveManagerWalletAddressUseCase,
    private walletAddressManagementService: WalletAddressManagementService,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async activeWalletAddress(walletAddressId: string, body: ActiveWalletAddressByAdminRequest) {
    this.log.debug(
      `Start implement activeWalletAddressByAdmin for ${body.managerId} and walletAddressId ${walletAddressId}`
    );
    const merchantManager = await this.adminProfileService.findOneById(body.managerId, OperationType.MERCHANT_MANAGER);
    const walletAddressInfo = await this.walletAddressManagementService.getOneByIdAndManagerId(walletAddressId, merchantManager.id);
    if (!merchantManager) {
      return OperationError.MERCHANT_NOT_FOUND;
    }
    const order = await this.sharedOrderService.getPendingOrderByOperation(body.managerId, OperationType.MERCHANT_MANAGER);
    if (order) {
      return OperationWalletError.MANAGER_HAS_PENDING_ORDER;
    }
    await this.activeManagerWalletAddressUseCase.activeWalletAddress(merchantManager, walletAddressId);
    this.eventDispatcher.dispatch(events.actions.operation.onSwapWalletAddressByAdmin, {
      manager: merchantManager,
      newWalletAddress: walletAddressInfo.walletAddress,
    });
    this.log.debug(`
      Stop implement activeWalletAddressByAdmin for ${body.managerId} and walletAddressId ${walletAddressId}
    `);
    return null;
  }
}
