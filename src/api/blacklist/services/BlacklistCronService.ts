import { BlacklistRepository } from '@api/blacklist/repositories/BlacklistRepository';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { env } from '@base/env';
import axios from 'axios';
import { ethers } from 'ethers';
import TronWeb from 'tronweb';
import { Service } from 'typedi';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { v4 } from 'uuid';
import { BLACKLIST_INSERTED_TYPE, BlacklistEntity } from '../models/BlacklistEntity';
import { SharedProfileService } from '@api/profile/services/SharedProfileService';
import { TradeType } from '@api/common/models';
import { events } from '@api/subscribers/events';
import { SharedOrderService } from '@api/order/services/order/SharedOrderService';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { SessionUtil } from '@base/utils/session.util';
import { SocketFactory } from '@api/sockets/SocketFactory';
import { TRANSACTION_DEFAULT_OPTIONS } from '@api/common/constants/TransactionConstant';

@Service()
export class BlacklistCronService {
  constructor(
    @InjectRepository() private blacklistRepository: BlacklistRepository,
    private operationService: SharedProfileService,
    private orderService: SharedOrderService,
    private socketFactory: SocketFactory,
    @Logger(__filename) private log: LoggerInterface,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {}

  public async handleCrawlData() {
    const { data } = await axios.get(env.blacklist.crawlURL);
    const validData = data
      .split('\n')
      .filter((item: string) => item?.length > 0)
      .filter((item: string) => this.validateAddress(item));
    await this.insertBlacklist(validData);
  }

  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  public async insertBlacklist(addresses: string[]) {
    try {
      const walletsInManagement = await this.operationService.getManagementWalletAddresses(addresses);
      const walletsInOperations = await this.operationService.getOperationWalletAddresses(addresses);

      const persistedBlacklistAddresses = await this.blacklistRepository
        .createQueryBuilder('blacklists')
        .select('blacklists.walletAddress', 'walletAddress')
        .where('blacklists.walletAddress IN (:...walletAddresses)', { walletAddresses: addresses })
        .execute();

      const notValidAddressSet = new Set([
        ...walletsInManagement.map((item: any) => item.walletAddress),
        ...walletsInOperations.map((item: any) => item.walletAddress),
      ]);
      const persistedBlacklistAddressSet = new Set(persistedBlacklistAddresses.map((item: any) => item.walletAddress));

      const validAddresses = addresses.filter(
        (address) => !notValidAddressSet.has(address) && !persistedBlacklistAddressSet.has(address)
      );

      const entities = validAddresses.map((address: string) => {
        const entity = new BlacklistEntity();
        entity.id = v4();
        entity.type = BLACKLIST_INSERTED_TYPE.CRAWL;
        entity.walletAddress = address;
        return entity;
      });

      await this.blacklistRepository
        .createQueryBuilder()
        .insert()
        .into(BlacklistEntity)
        .values(entities)
        .orIgnore(true)
        .execute();

      const users = await this.operationService.getUsersByWalletAddresses(validAddresses);
      await Promise.allSettled(users.map(async (user) => {
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
      }));
    } catch (error) {
      this.log.error('Error in crawl insertBlacklist', error);
    }
  }

  private validateAddress(walletAddress: string): boolean {
    return TronWeb.isAddress(walletAddress) || ethers.utils.isAddress(walletAddress);
  }
}
