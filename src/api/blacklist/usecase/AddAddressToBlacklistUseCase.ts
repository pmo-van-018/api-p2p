import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import { BlacklistService } from '@api/blacklist/services/BlacklistService';
import { BlackListResponseError } from '@api/blacklist/errors/BlackListResponseError';
import { AddWalletAddressRequest } from '@api/blacklist/requests/AddWalletAddressRequest';
import { SharedProfileService } from '@api/profile/services/SharedProfileService';
import { SharedOrderService } from '@api/order/services/order/SharedOrderService';
import { TradeType } from '@api/common/models';
import { events } from '@api/subscribers/events';
import { EventDispatcher, EventDispatcherInterface} from '@base/decorators/EventDispatcher';
import { SessionUtil } from '@base/utils/session.util';
import { SocketFactory } from '@api/sockets/SocketFactory';

@Service()
export class AddAddressToBlacklistUseCase {
  constructor(
    private blacklistService: BlacklistService,
    private sharedProfileService: SharedProfileService,
    private orderService: SharedOrderService,
    private socketFactory: SocketFactory,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async addWalletAddress(data: AddWalletAddressRequest) {
    this.log.debug(`[addWalletAddressToBlacklist] Start to add wallet address to blacklist: ${data.walletAddress}`);

    const { walletAddress } = data;

    const isExist = await this.blacklistService.isBlacklisted(walletAddress);
    if (isExist) {
      return BlackListResponseError.WALLET_ADDRESS_IS_EXISTED_IN_BLACKLIST;
    }

    const [isOperationExit, isWalletAddressExist] = await Promise.all([
      this.sharedProfileService.checkOperationWalletAddressIsExist(walletAddress),
      this.sharedProfileService.checkWalletAddressManagementIsExist(walletAddress),
    ]);

    if (isOperationExit || isWalletAddressExist) {
      return BlackListResponseError.WALLET_ADDRESS_IS_EXISTING_IN_OTHER_ROLES;
    }

    const user = await this.sharedProfileService.findUserByWalletAddress(walletAddress);
    if (user) {
      SessionUtil.destroy(user.id.toString());
      this.socketFactory.emitToRoom(user.walletAddress, {
        event: events.objects.user,
        action: events.actions.user.blocked,
      });
      const processingOrder = await this.orderService.getProcessingOrderByUser(user.id);
      if (processingOrder) {
        const event =
          processingOrder.type === TradeType.BUY
            ? events.actions.order.buy.adminAddToBacklist
            : events.actions.order.sell.adminAddToBacklist;
        this.eventDispatcher.dispatch(event, processingOrder.id);
      }
    }
    await this.blacklistService.addAddressToBlacklist(walletAddress);
    this.log.debug('[addWalletAddressToBlacklist] End to add wallet address to blacklist');
    return null;
  }
}
