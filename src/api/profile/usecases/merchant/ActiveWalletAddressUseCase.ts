import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { WalletAddressManagementService } from '@api/profile/services/WalletAddressManagementService';
import {OperationWalletError} from '@api/profile/errors/OperationWallet';
import {Operation} from '@api/profile/models/Operation';
import {SharedBlacklistService} from '@api/blacklist/services/SharedBlacklistService';
import {WalletAddressStatus} from '@api/common/models';
import {SharedOrderService} from '@api/order/services/order/SharedOrderService';
import {Transactional} from 'typeorm-transactional-cls-hooked';
import {TRANSACTION_DEFAULT_OPTIONS} from '@api/common/constants/TransactionConstant';

@Service()
export class ActiveWalletAddressUseCase {
  constructor(
    private walletAddressManagementService: WalletAddressManagementService,
    private sharedBlacklistService: SharedBlacklistService,
    private sharedOrderService: SharedOrderService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  public async activeWalletAddress(currentUser: Operation, walletAddressId: string) {
    this.log.debug(
      `Start implement activeWalletAddressByManager for ${currentUser.type} ${currentUser.id} and walletAddressId ${walletAddressId}`
    );
    const walletAddressInfo = await this.walletAddressManagementService.getOneByIdAndManagerId(walletAddressId, currentUser.id);
    if (!walletAddressInfo) {
      return OperationWalletError.WALLET_ADDRESS_NOT_FOUND;
    }
    if (
      walletAddressInfo.status === WalletAddressStatus.ACTIVE ||
      walletAddressInfo.walletAddress === currentUser.walletAddress
    ) {
      return OperationWalletError.WALLET_ADDRESS_HAS_ACTIVED;
    }
    if (await this.sharedBlacklistService.isBlacklisted(walletAddressInfo.walletAddress)) {
      return OperationWalletError.THE_WALLET_ADDRESS_IS_IN_THE_BLACKLIST;
    }

    const order = await this.sharedOrderService.getPendingOrderByOperation(currentUser.id, currentUser.type);
    if (order) {
      return OperationWalletError.MANAGER_HAS_PENDING_ORDER;
    }

    const walletAddressActive = await this.walletAddressManagementService.getActiveWalletAddress(currentUser.id);
    await this.walletAddressManagementService.swapWalletAddress(
      currentUser.id,
      walletAddressActive,
      walletAddressInfo
    );
    this.walletAddressManagementService.destroySessionAndSendMessageToManager(currentUser);
    this.log.debug(`
      Stop implement activeWalletAddressByManager for ${currentUser.type} ${currentUser.id} and walletAddressId ${walletAddressId}
    `);
    return null;
  }
}
