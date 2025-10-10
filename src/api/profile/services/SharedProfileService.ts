import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { OperationRepository } from '../repositories/OperationRepository';
import { NotificationType, OperationStatus, OperationType, UserType } from '@api/common/models';
import {FindConditions, In, UpdateResult} from 'typeorm';
import { ExportReportRequest } from '@api/statistic/requests/ExportReportRequest';
import { Operation } from '@api/profile/models/Operation';
import { BaseProfileService } from '@api/profile/services/BaseProfileService';
import { UserRepository } from '@api/profile/repositories/UserRepository';
import { WalletAddressManagementRepository } from '@api/profile/repositories/WalletManagementRepository';
import { MerchantType, PaginationResult, WhereConditions } from '@api/common/types';
import { FindAllMerchants, FindOneMerchant, MerchantPublicInfo } from '@api/profile/types/Operation';
import { EntityBase } from '@api/infrastructure/abstracts/EntityBase';
import { wrap } from '@base/utils/redis-client';
import { MIN_MERCHANT_LEVEL } from '@api/common/models/P2PConstant';
import { OperationError } from '@api/errors/OperationError';
import { P2PError } from '@api/common/errors/P2PError';
import { ethers } from 'ethers';
import { isTronWalletAddress } from '@api/order/services/TronService';
import moment from 'moment';
import { User } from '@api/profile/models/User';
import { env } from '@base/env';
import { events } from '@api/subscribers/events';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { UserError } from '@api/profile/errors/UserError';

export const AVATARS_CACHE_KEY = 'avatars_cache';

@Service()
export class SharedProfileService extends BaseProfileService {
  constructor(
    @InjectRepository() private userRepository: UserRepository,
    @InjectRepository() protected operationRepository: OperationRepository,
    @InjectRepository() private walletAddressManagementRepository: WalletAddressManagementRepository,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
    @Logger(__filename) private log: LoggerInterface
  ) {
    super(operationRepository);
  }

  public async lockOperationPessimistic(operationId: string): Promise<void> {
    this.log.debug(`Start implement lockOperationPessimistic with operationId: ${operationId}`);
    await this.operationRepository.lockOperationPessimistic(operationId);
    this.log.debug(`Stop implement lockOperationPessimistic with operationId: ${operationId}`);
  }

  public async findUserByWalletAddress(walletAddress: string): Promise<User> {
    return await this.userRepository.findOne({ where: { walletAddress }, withDeleted: true });
  }

  public async createUser<
    P extends Partial<Omit<User, keyof EntityBase | 'walletAddress'>> & {
      walletAddress: string;
    }
  >(payload: P): Promise<User> {
    const user = this.userRepository.merge(this.userRepository.create(), {
      ...payload,
      allowNotification: [NotificationType.ALL],
    });
    const newUser = await this.userRepository.save(user);
    // handle other tasks in background
    this.eventDispatcher.dispatch(events.actions.user.created, newUser);
    return newUser;
  }

  public async clearUserNotHasOrder() {
    const dayNumber = env.dayClearUser.dayClear;
    const now = moment(new Date()).utc().format('YYYY-MM-DD HH:mm:ss');
    const query = `DELETE
    FROM users us
    WHERE DATEDIFF(?, us.created_at) >= ?
          AND type = ?
          AND NOT EXISTS (SELECT id
                      FROM orders
                      WHERE user_id = us.id
                      ORDER BY id ASC
                      LIMIT 1)
    `;
    return await this.userRepository.query(query, [now, dayNumber, UserType.USER]);
  }

  public async findOneOperationBy(
    where: WhereConditions<Pick<Operation, 'id' | 'walletAddress' | 'nickName'>>,
    options?: {
      withDeleted?: boolean;
    }
  ): Promise<Operation | undefined> {
    return await this.operationRepository.findOne({ where, withDeleted: options?.withDeleted });
  }

  public async updateOperationLoginAt(operationId: string): Promise<UpdateResult> {
    return await this.operationRepository.update({ id: operationId }, { lastLoginAt: moment().utc().toDate() }, true);
  }

  public isOperationBlocked(operator: Operation): boolean {
    return (
      operator.status === OperationStatus.INACTIVE ||
      operator.status === OperationStatus.BLOCKED ||
      this.isUserViolateOrderRule(operator)
    );
  }

  public async findAllActiveOperations(types: OperationType[]) {
    return await this.operationRepository.find(
      {
        where: {
          type: In(types),
          status: OperationStatus.ACTIVE,
        },
      }
    );
  }

  public async findOperationsByManagerId(managerId: string, types: OperationType[]) {
    return await this.operationRepository.find(
      {
        where: {
          merchantManagerId: managerId,
          type: In(types),
          status: OperationStatus.ACTIVE,
        },
      }
    );
  }

  public async findManagerById(operationId: string) {
    return await this.operationRepository.findOne({ id: operationId, type: OperationType.MERCHANT_MANAGER });
  }

  public async getOperationById(id: string) {
    return await this.operationRepository.findOne({ id });
  }

  public async findManagerByRefId(operationId: string) {
    return await this.operationRepository.findOne({ refId: operationId, type: OperationType.MERCHANT_MANAGER });
  }

  public async getOperationWalletAddresses(walletAddresses: string[]) {
    return await this.operationRepository.createQueryBuilder('operations')
      .select('operations.walletAddress', 'walletAddress')
      .where('operations.walletAddress IN (:...walletAddresses)', { walletAddresses })
      .execute();
  }

  public async statisticStaffByManager(merchantManagerId: string) {
    return await this.operationRepository.statisticStaffByManager( merchantManagerId);
  }

  public async statisticOperationsByStatus(operationType: OperationType[]) {
    return await this.operationRepository.statisticOperationsByStatus(operationType);
  }

  public async statisticManagerByStatus(operationTypes: OperationType[]) {
    return await this.operationRepository.statisticManagerByStatus(operationTypes);
  }

  public async getActiveOperations() {
    return this.operationRepository.getActiveOperationsInRange();
  }

  public async getRevenueData(filter: ExportReportRequest) {
    return await this.operationRepository.calculateRevenueManager(filter);
  }

  public async getManagerStatistic(filter: ExportReportRequest) {
    return await this.operationRepository.getManagerStatistic(filter);
  }

  public async getSupporterStatistic(managerId: string) {
    return await this.operationRepository.getSupporterStatisticData(managerId);
  }

  public async getOperatorStatistic(managerId: string) {
    return await this.operationRepository.getOperatorStatisticData(managerId);
  }

  public async findAllStaffsByManagerId(managerId: string): Promise<Operation[]> {
    return this.operationRepository.find({
      where: {
        merchantManagerId: managerId,
        status: OperationStatus.ACTIVE,
      },
    });
  }

  public async findAllAdmins(types?: OperationType[]): Promise<Operation[]> {
    return await this.operationRepository.findAllAdmins(types);
  }

  public async findAllSupportersByManagerId(managerId: string): Promise<Operation[]> {
    this.log.debug(`Start implement findAllSupportersByManagerId for ${managerId}`);
    const supporters = await this.operationRepository.findAllSupportersByManagerId(managerId);
    this.log.debug(`Stop implement findAllSupportersByManagerId for ${managerId}`);
    return supporters;
  }

  public async findAllOperatorByMerchantManagerRefId(merchantManagerRefId: string) {
    return await this.operationRepository.findAllOperatorByMerchantManagerRefId(merchantManagerRefId);
  }

  public async checkOperationWalletAddressIsExist(walletAddress: string) {
    this.log.debug(`Start implement checkWalletAddressIsExist with wallet address: ${walletAddress}`);
    const operation = await this.operationRepository.findOne({
      where: {
        walletAddress,
      },
      withDeleted: true,
    });
    this.log.debug(`Stop implement checkWalletAddressIsExist with wallet address: ${walletAddress}`);
    return !!operation;
  }

  public async lockUserPessimistic(userId: string): Promise<void> {
    this.log.debug(`Start implement lockUserPessimistic with userId: ${userId}`);
    await this.userRepository.lockUserPessimistic(userId);
    this.log.debug(`Stop implement lockUserPessimistic with userId: ${userId}`);
  }

  public async getUsersByWalletAddresses(walletAddresses: string[]) {
    this.log.debug(`Start implement getUsersByWalletAddresses with wallet addresses: ${walletAddresses}`);
    const users = await this.userRepository.find({
      where: {
        walletAddress: In(walletAddresses),
      },
    });
    this.log.debug(`Stop implement getUsersByWalletAddresses with wallet addresses: ${walletAddresses}`);
    return users;
  }

  public async statisticUsersByStatus(userTypes: UserType[]) {
    return await this.userRepository.statisticUsersByStatus(userTypes);
  }

  public async getUserById(id: string) {
    return await this.userRepository.findOne({ id });
  }

  public async getActiveUsers() {
    return await this.userRepository.getActiveUsers();
  }

  public async checkWalletAddressManagementIsExist(walletAddress: string) {
    this.log.debug(`Start implement checkWalletAddressIsExist with wallet address: ${walletAddress}`);
    const walletAddressManagement = await this.walletAddressManagementRepository.findOne({
      where: {
        walletAddress,
      },
    });
    this.log.debug(`Stop implement checkWalletAddressIsExist with wallet address: ${walletAddress}`);
    return !!walletAddressManagement;
  }

  public async getManagementWalletAddresses(walletAddresses: string[]) {
    return await this.walletAddressManagementRepository
      .createQueryBuilder('wallet_address_managements')
      .select('wallet_address_managements.walletAddress', 'walletAddress')
      .where('wallet_address_managements.walletAddress IN (:...walletAddresses)', { walletAddresses })
      .execute();
  }

  public async getManagementWalletAddress(walletAddress: string) {
    return await this.walletAddressManagementRepository.findOne({
      where: {
        walletAddress,
      },
      withDeleted: true,
    });
  }

  public async findOneMerchant(options: {
    where: WhereConditions<FindOneMerchant>;
    relations?: string[];
    withDeleted?: boolean;
  }): Promise<Operation> {
    return await this.operationRepository.findOne({
      where: {
        ...options.where,
      },
      relations: options.relations,
      withDeleted: options.withDeleted,
    });
  }

  public async findAllMerchants(options: FindAllMerchants): Promise<PaginationResult<Operation>> {
    return await this.operationRepository.findAllMerchants(options);
  }

  public async updateByOperatorId<P extends Partial<Omit<Operation, keyof EntityBase | 'id'>>>(
    operationId: string,
    payload: P
  ): Promise<UpdateResult> {
    return await this.operationRepository.update({ id: operationId }, payload);
  }

  public async updateByUserId<P extends Partial<Omit<User, keyof EntityBase | 'id'>>>(
    userId: string,
    payload: P
  ): Promise<UpdateResult> {
    return await this.userRepository.update({ id: userId }, payload);
  }

  public async getAvatarsUsed() {
    return await wrap(AVATARS_CACHE_KEY, () =>
      this.operationRepository.find({
        where: {
          type: OperationType.MERCHANT_MANAGER,
        },
        select: ['avatar'],
      })
    );
  }

  public async checkErrorAndReturnMerchant(
    userOrId: Operation | string,
    merchantType: MerchantType | OperationType = OperationType.MERCHANT_OPERATOR
  ): Promise<Operation> {
    this.log.debug('Start implement checkErrorAndReturnMerchant method for: ', merchantType);
    const merchant = await this.checkErrorAndReturnOperation(userOrId, merchantType);
    merchant.merchantLevel = this.getMerchantLevel(merchant);
    this.log.debug(`Stop implement checkErrorAndReturnMerchant for ${userOrId} and type ${merchantType}`);
    return merchant;
  }

  public async checkErrorAndReturnUserWithCondition(conditions: FindConditions<User>): Promise<User> {
    this.log.debug(
      `Start implement checkErrorAndReturnUserWithCondition with conditions: ${JSON.stringify(conditions)}`
    );
    const user = await this.userRepository.findOne(conditions);
    if (!user) {
      throw new P2PError(UserError.USER_NOT_FOUND);
    }
    this.log.debug(`End implement checkErrorAndReturnUserWithCondition with conditions: ${JSON.stringify(conditions)}`);
    return user;
  }

  // hardcode to prevent old users have not merchant level.
  public getMerchantLevel(merchant: Operation): number {
    return merchant.merchantLevel ?? MIN_MERCHANT_LEVEL;
  }

  public async checkErrorAndReturnOperation(
    operatorOrId: Operation | string,
    roles?: MerchantType | OperationType | OperationType[]
  ): Promise<Operation> {
    this.log.debug(`Start implement checkErrorAndReturnOperation for ${operatorOrId} and roles ${roles}`);
    const id = this.isOperator(operatorOrId) ? operatorOrId.id : operatorOrId;
    let operator: Operation;
    if (!roles) {
      operator = await this.getOperationById(id);
    } else {
      operator = await this.findOneUserWithRoles(id, roles);
    }
    if (!operator) {
      this.throwRoleError(roles[0]);
    }
    this.log.debug(`Stop implement checkErrorAndReturnOperation for ${operatorOrId} and roles ${roles}`);
    return operator;
  }

  public async findOneUserWithRoles(id: string, roles: MerchantType | OperationType | OperationType[]) {
    return await this.operationRepository.findOne({
      id,
      type: Array.isArray(roles) ? In(roles) : roles,
    });
  }

  public async fullFillMerchantStatistic(
    originalData: PaginationResult<MerchantPublicInfo>
  ): Promise<PaginationResult<MerchantPublicInfo>> {
    const statisticData = await this.operationRepository.getStatisticByOperationIds(
      originalData.items.map((e) => e.id)
    );

    const statisticMap = statisticData.reduce((acc, cur) => {
      acc[cur.operationId] = cur;
      return acc;
    }, {});
    originalData.items.forEach((item) => {
      const statistic = statisticMap[item.id];
      item.statistic = { ...item.statistic, ...statistic };
    });
    return {
      items: originalData.items,
      totalItems: originalData.totalItems,
      totalPages: originalData.totalPages,
      currentUserType: originalData.currentUserType,
      limit: originalData.limit,
      page: originalData.page,
    };
  }

  public validateWalletAddress(walletAddress: string) {
    return ethers.utils.isAddress(walletAddress) || isTronWalletAddress(walletAddress);
  }

  public async isExistNickName(nickName: string) {
      const operation = await this.operationRepository.findOne({
        where: {
          nickName,
        },
      });
      if (operation) {
        return true;
      }
      const user = await this.userRepository.findOne({
        where: {
          nickName,
        },
      });
      return !!user;
    }
  protected throwRoleError(role: OperationType) {
    if (role === OperationType.SUPER_ADMIN) {
      throw new P2PError(OperationError.ADMIN_NOT_FOUND);
    }
    if (role === OperationType.MERCHANT_OPERATOR || role === OperationType.MERCHANT_MANAGER) {
      throw new P2PError(OperationError.MERCHANT_NOT_FOUND);
    }
    throw new P2PError(OperationError.OPERATION_NOT_FOUND);
  }
}
