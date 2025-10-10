import { P2PError } from '@api/common/errors/P2PError';
import { OperationType, WalletAddressStatus } from '@api/common/models';
import { OrderRepository } from '@api/order/repositories/OrderRepository';
import { OperationWalletError } from '@api/profile/errors/OperationWallet';
import { Operation } from '@api/profile/models/Operation';
import { OperationRepository } from '@api/profile/repositories/OperationRepository';
import { UserRepository } from '@api/profile/repositories/UserRepository';
import { WalletAddressManagementRepository } from '@api/profile/repositories/WalletManagementRepository';
import { ActiveWalletAddressByAdminRequest } from '@api/profile/requests/ActiveWalletAddressByAdminRequest';
import { AddNewWalletAddressByAdminRequest } from '@api/profile/requests/AddNewWalletAddressByAdminRequest';
import { AddNewWalletAddressRequest } from '@api/profile/requests/AddNewWalletAddressRequest';
import { DeleteWalletAddressByAdminRequest } from '@api/profile/requests/DeleteWalletAddressByAdminRequest';
import { SocketFactory } from '@api/sockets/SocketFactory';
import { events } from '@api/subscribers/events';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { SessionUtil } from '@base/utils/session.util';
import { Service } from 'typedi';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { WalletAddressManagement } from '../models/WalletAddressManagement';
import { SharedBlacklistService } from '@api/blacklist/services/SharedBlacklistService';
import moment from 'moment';
import { TRANSACTION_DEFAULT_OPTIONS } from '@api/common/constants/TransactionConstant';

@Service()
export class WalletAddressManagementService {
  constructor(
    private socketFactory: SocketFactory,
    private readonly blacklistService: SharedBlacklistService,
    @InjectRepository() private operationRepository: OperationRepository,
    @InjectRepository() private orderRepository: OrderRepository,
    @InjectRepository() private userRepository: UserRepository,
    @InjectRepository() private walletAddressManagementRepository: WalletAddressManagementRepository,
    @Logger(__filename) private log: LoggerInterface,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {}

  public async addNewWalletAddressByManager(operationId: string, walletAddress: string) {
    await this.walletAddressManagementRepository.save({ operationId, walletAddress });
  }

  public async createActiveWalletAddress(operationId: string, walletAddress: string) {
    return await this.walletAddressManagementRepository.save({
      walletAddress,
      status: WalletAddressStatus.ACTIVE,
      operationId,
    });
  }

  public async addNewWalletAddressByAdmin(data: AddNewWalletAddressByAdminRequest) {
    const manager = await this.getMerchantManagerById(data.managerId);
    await this.addNewWalletAddress(manager, data);
  }

  public async getWalletAddressListByManagerId(operationId: string) {
    return await this.walletAddressManagementRepository.find({
      where: { operationId },
      order: {
        status: 'ASC',
        createdAt: 'ASC',
      },
    });
  }

  public async checkExist(walletAddress: string) {
    const walletAddressManagement = await this.walletAddressManagementRepository.findOne({
      where: {
        walletAddress,
      },
      withDeleted: true,
    });
    return !!walletAddressManagement;
  }

  public async getOneByIdAndManagerId(id: string, managerId: string) {
    return await this.walletAddressManagementRepository.findOne({
      where: { id, operationId: managerId },
    });
  }

  public async getActiveWalletAddress(managerId: string) {
    return await this.walletAddressManagementRepository.findOne({
      status: WalletAddressStatus.ACTIVE,
      operationId: managerId,
    });
  }

  public async activeWalletAddressByAdmin(
    data: ActiveWalletAddressByAdminRequest,
    walletAddressId: string
  ): Promise<void> {
    this.log.debug(
      `Start implement activeWalletAddressByAdmin for ${data.managerId} and walletAddressId ${walletAddressId}`
    );
    const manager = await this.getMerchantManagerById(data.managerId);
    const walletAddressInfo = await this.findAndValidateWalletAddress(manager, walletAddressId);
    await this.activeWalletAddress(manager, walletAddressInfo);
    this.eventDispatcher.dispatch(events.actions.operation.onSwapWalletAddressByAdmin, {
      manager,
      newWalletAddress: walletAddressInfo.walletAddress,
    });
    this.log.debug(`
      Stop implement activeWalletAddressByAdmin for ${data.managerId} and walletAddressId ${walletAddressId}
    `);
  }

  public async deleteWalletAddressByManager(currentUser: Operation, walletAddressId: string): Promise<void> {
    this.log.debug(`
      Start implement deleteWalletAddressByManager for ${currentUser.type} ${currentUser.id} and walletAddressId ${walletAddressId}
    `);
    await this.deleteWalletAddress(currentUser, walletAddressId);
    this.log.debug(`
      Stop implement deleteWalletAddressByManager for ${currentUser.type} ${currentUser.id} and walletAddressId ${walletAddressId}
    `);
  }

  public async deleteWalletAddressByAdmin(
    data: DeleteWalletAddressByAdminRequest,
    walletAddressId: string
  ): Promise<void> {
    this.log.debug(`
    Start implement deleteWalletAddressByAdmin for ${data.managerId} and walletAddressId ${walletAddressId}
    `);
    const manager = await this.getMerchantManagerById(data.managerId);
    await this.deleteWalletAddress(manager, walletAddressId);
    this.log.debug(`
    Stop implement deleteWalletAddressByAdmin for ${data.managerId} and walletAddressId ${walletAddressId}
    `);
  }

  public async findWalletAddress(walletAddress: string) {
    return this.walletAddressManagementRepository.findOne({
      where: {
        walletAddress,
      },
      withDeleted: true,
    });
  }

  public async swapWalletAddress(managerId: string, walletAddressActive: WalletAddressManagement, walletAddressInfo: WalletAddressManagement) {
    this.log.debug(
      `Start implement swapWalletAddress for ${managerId} and walletAddressInfo ${JSON.stringify(walletAddressInfo)}`
    );
    await Promise.all([
      this.walletAddressManagementRepository.update(
        {
          id: walletAddressInfo.id,
        },
        {
          status: WalletAddressStatus.ACTIVE,
        }
      ),
      this.walletAddressManagementRepository.update(
        {
          id: walletAddressActive.id,
        },
        {
          status: WalletAddressStatus.INACTIVE,
        }
      ),
      this.operationRepository.update(
        {
          id: managerId,
        },
        {
          walletAddress: walletAddressInfo.walletAddress,
        }
      ),
    ]);
    this.log.debug(
      `Stop implement swapWalletAddress for ${managerId} and walletAddressInfo ${JSON.stringify(walletAddressInfo)}`
    );
  }

  public destroySessionAndSendMessageToManager(operator: Operation): void {
    this.log.debug(`Start implement destroySessionAndSendMessageToManager for ${operator.type} ${operator.id}`);
    SessionUtil.destroy(operator.id.toString());
    this.socketFactory.emitToRoom(operator.walletAddress, {
      event: events.objects.user,
      action: events.actions.user.deactivated,
    });
    this.log.debug(`Stop implement destroySessionAndSendMessageToManager for ${operator.type} ${operator.id}`);
  }

  public async countWalletAddressByManager(operationId: string) {
    return await this.walletAddressManagementRepository.count({
      where: { operationId },
    });
  }

  public async softDelete(id: string) {
    await this.walletAddressManagementRepository.softDelete(id);
  }

  protected async addNewWalletAddress(manager: Operation, data: AddNewWalletAddressRequest) {
    this.log.debug(
      `Start implement addNewWalletAddress for ${manager.type} ${manager.id} and walletAddress ${data.walletAddress}`
    );
    await this.validateExistWalletAddress(data.walletAddress);
    try {
      await this.walletAddressManagementRepository.save({
        operationId: manager.id,
        walletAddress: data.walletAddress,
      });
      await this.operationRepository.update(manager.id, { updatedAt: moment.utc().toDate()});
    } catch (error: any) {
      this.log.error(error?.name, error?.stack);
      throw new P2PError(OperationWalletError.ADD_WALLET_ADDRESS_FAIL);
    }
    this.log.debug(`
      Stop implement addNewWalletAddress for ${manager.type} ${manager.id} and walletAddress ${data.walletAddress}
    `);
  }

  protected async deleteWalletAddress(manager: Operation, walletAddressId: string): Promise<void> {
    this.log.debug(`
    Start implement deleteWalletAddress for ${manager.type} ${manager.id} and walletAddressId ${walletAddressId}
    `);
    const countWalletAddressOfManager = await this.walletAddressManagementRepository.count({
      where: {
        operationId: manager.id,
      },
    });
    if (countWalletAddressOfManager <= 1) {
      throw new P2PError(OperationWalletError.WALLET_ADDRESS_CANNOT_EMPTY);
    }
    const walletAddressInfo = await this.findAndValidateWalletAddress(manager, walletAddressId);
    try {
      await this.walletAddressManagementRepository.softDelete(walletAddressInfo.id);
      await this.operationRepository.update(manager.id, { updatedAt: moment.utc().toDate()});
    } catch (error: any) {
      this.log.error(error.message ?? error);
      throw new P2PError(OperationWalletError.DELETE_WALLET_ADDRESS_FAIL);
    }
    this.log.debug(`
    Stop implement deleteWalletAddress for ${manager.type} ${manager.id} and walletAddressId ${walletAddressId}
    `);
  }

  protected async findAndValidateWalletAddress(
    currentUser: Operation,
    walletAddressId: string
  ): Promise<WalletAddressManagement> {
    this.log.debug(`
    Start implement findAndValidateWalletAddress for ${currentUser.type} ${currentUser.id} and walletAddressId ${walletAddressId}
    `);
    const walletAddressInfo = await this.walletAddressManagementRepository.findOne({
      where: {
        id: walletAddressId,
        operationId: currentUser.id,
      },
    });
    if (!walletAddressInfo) {
      throw new P2PError(OperationWalletError.WALLET_ADDRESS_NOT_FOUND);
    }
    if (
      walletAddressInfo.status === WalletAddressStatus.ACTIVE ||
      walletAddressInfo.walletAddress === currentUser.walletAddress
    ) {
      throw new P2PError(OperationWalletError.WALLET_ADDRESS_HAS_ACTIVED);
    }
    await this.blacklistService.validateWalletAddressInBlacklist(walletAddressInfo.walletAddress);
    this.log.debug(`
    Stop implement findAndValidateWalletAddress for ${currentUser.type} ${currentUser.id} and walletAddressId ${walletAddressId}
    `);
    return walletAddressInfo;
  }

  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  protected async activeWalletAddress(
    currentUser: Operation,
    walletAddressInfo: WalletAddressManagement
  ): Promise<void> {
    this.log.debug(`Start implement activeWalletAddress for ${currentUser.type} ${currentUser.id}`);
    await this.validatePendingOrderByManagerId(currentUser.id);
    try {
      const walletAddressActive = await this.getActiveWalletAddress(currentUser.id);
      await this.swapWalletAddress(currentUser.id, walletAddressActive, walletAddressInfo);
      this.destroySessionAndSendMessageToManager(currentUser);
    } catch (error: any) {
      this.log.error(error.message ?? error);
      throw new P2PError(OperationWalletError.ACTIVE_WALLET_ADDRESS_FAIL);
    }
    this.log.debug(`Stop implement activeWalletAddress for ${currentUser.type} ${currentUser.id}`);
  }

  protected async validatePendingOrderByManagerId(managerId: string): Promise<void> {
    this.log.debug(`Start implement validatePendingOrderByManagerId for ${managerId}`);
    const pendingOrder = await this.orderRepository.getPendingOrderByOperation(
      managerId,
      OperationType.MERCHANT_MANAGER
    );
    if (pendingOrder) {
      throw new P2PError(OperationWalletError.MANAGER_HAS_PENDING_ORDER);
    }
    this.log.debug(`Stop implement validatePendingOrderByManagerId for ${managerId}`);
  }

  protected async validateExistWalletAddress(walletAddress: string) {
    this.log.debug(`Start implement validateExistWalletAddress for ${walletAddress}`);
    await this.blacklistService.validateWalletAddressInBlacklist(walletAddress);
    const walletAddressManagement = await this.walletAddressManagementRepository.findOne({
      where: {
        walletAddress,
      },
      withDeleted: true,
    });
    if (walletAddressManagement) {
      throw new P2PError(OperationWalletError.WALLET_ADDRESS_IS_EXISTED);
    }
    const operation = await this.operationRepository.findOne({
      where: {
        walletAddress,
      },
      withDeleted: true,
    });
    if (operation) {
      throw new P2PError(OperationWalletError.WALLET_ADDRESS_IS_EXISTED);
    }
    const user = await this.userRepository.findOne({
      where: {
        walletAddress,
      },
      withDeleted: true,
    });
    if (user) {
      throw new P2PError(OperationWalletError.WALLET_ADDRESS_IS_EXISTED);
    }
    this.log.debug(`Stop implement validateExistWalletAddress for ${walletAddress}`);
  }

  protected async getMerchantManagerById(managerId: string) {
    this.log.debug(`Start implement getMerchantManagerById for ${managerId}`);
    const manager = await this.operationRepository.findOne({
      where: {
        id: managerId,
      },
    });
    if (!manager) {
      throw new P2PError(OperationWalletError.MANAGER_NOT_FOUND);
    }
    this.log.debug(`Stop implement getMerchantManagerById for ${managerId}`);
    return manager;
  }
}
