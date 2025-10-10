import { SearchType, UserStatus, UserType } from '@api/common/models/P2PEnum';
import { RepositoryBase } from '@api/infrastructure/abstracts/RepositoryBase';
import { User } from '@api/profile/models/User';
import { GetListUsersByAdminParamsRequest } from '@api/profile/requests/GetListUsersByAdminParamsRequest';
import { UserViewByAdmin, UserViewByUser } from '@api/profile/types/User';
import moment from 'moment';
import { EntityRepository } from 'typeorm';

@EntityRepository(User)
export class UserRepository extends RepositoryBase<User> {
  public async statisticUsersByStatus(userTypes: UserType[]) {
    const query = this.createQueryBuilder('user');
    query.where('user.type IN (:userTypes)', { userTypes });
    query.select('SUM(CASE WHEN user.status = 1 THEN 1 ELSE 0 END)', 'totalActive');
    query
      .select('SUM(CASE WHEN user.status = 1 THEN 1 ELSE 0 END)', 'totalActive')
      .addSelect('SUM(CASE WHEN user.status = 2 THEN 1 ELSE 0 END)', 'totalInactive')
      .addSelect('SUM(CASE WHEN user.status = 3 THEN 1 ELSE 0 END)', 'totalBlock')
      .addSelect('SUM(CASE WHEN user.status = 4 THEN 1 ELSE 0 END)', 'totalDelete');
    return query.getRawOne();
  }

  public async getActiveUsers(): Promise<User[]> {
    return this.createQueryBuilder('user')
      .leftJoinAndSelect('user.statistic', 'statistic')
      .where('user.type = :userType', { userType: [UserType.USER] })
      .getMany();
  }

  public async searchInviterByReferralCode(referralCode: string) {
    return this.createQueryBuilder('user')
      .where('user.referralCode = :referralCode COLLATE utf8mb4_bin', { referralCode })
      .andWhere('user.status = :status', { status: UserStatus.ACTIVE })
      .getOne();
  }

  public async getListUsersByAdmin(filter: GetListUsersByAdminParamsRequest): Promise<[UserViewByAdmin[], number]> {
    const { page, limit, startDate, endDate, fieldDate, searchValue, searchType, orderDirection, orderField } = filter;
    const queryBuilder = this.createQueryBuilder('user')
      .leftJoinAndSelect('user.statistic', 'statistic')
      .leftJoin('user.orders', 'orders')
      .addSelect('user.id', 'id')
      .addSelect('MAX(user.walletAddress)', 'walletAddress')
      .addSelect('MAX(user.nickName)', 'nickName')
      .addSelect('MAX(user.createdAt)', 'createdAt')
      .addSelect('MAX(user.lastLoginAt)', 'lastLoginAt')
      .addSelect('MAX(statistic.totalBuyOrderCount)', 'totalBuyOrderCount')
      .addSelect('MAX(statistic.totalSellOrderCount)', 'totalSellOrderCount')
      .addSelect(`MAX (CASE WHEN orders.type = 'BUY' THEN orders.createdAt ELSE NULL END)`, 'lastBuyOrder')
      .addSelect(`MAX (CASE WHEN orders.type = 'SELL' THEN orders.createdAt ELSE NULL END)`, 'lastSellOrder')
      .addSelect('MAX(orders.createdAt)', 'lastTradeAt')
      .where('user.walletAddress is NOT NULL') // case (unknown) user wallet_address is SET to NULL
      .groupBy('user.id');
    if (startDate) {
      const startDateUtc = moment(startDate).utc().startOf('day').format('YYYY-MM-DD HH:mm:ss');
      const whereClause = fieldDate === 'lastTradeAt' ? 'orders.createdAt' : `user.${fieldDate}`;
      queryBuilder.andWhere(`${whereClause} > :startDate`, { startDate: startDateUtc });
    }
    if (endDate) {
      const endDateUtc = moment(endDate).utc().endOf('day').format('YYYY-MM-DD HH:mm:ss');
      const whereClause = fieldDate === 'lastTradeAt' ? 'orders.createdAt' : `user.${fieldDate}`;
      queryBuilder.andWhere(`${whereClause} < :endDate`, { endDate: endDateUtc });
    }
    if (searchValue) {
      if (searchType === SearchType.NICK_NAME) {
        queryBuilder.andWhere('user.nickName Regexp :search', { search: searchValue });
      } else {
        queryBuilder.andWhere('user.walletAddress = :search', { search: searchValue });
      }
    }
    if (page && limit) {
      const pagination = this.parseTakeSkipParams({ limit, page });
      queryBuilder.offset(pagination.limit * (pagination.page - 1)).limit(pagination.limit);
    }
    queryBuilder.orderBy(orderField, orderDirection);
    return Promise.all([queryBuilder.getRawMany(), queryBuilder.getCount()]);
  }

  public async getUserProfileByUserId(userId: string): Promise<UserViewByUser> {
    const queryBuilder = this.createQueryBuilder('user')
      .leftJoin('user.orders', 'orders')
      .addSelect('user.id', 'id')
      .addSelect('MAX(user.walletAddress)', 'walletAddress')
      .addSelect('MAX(user.nickName)', 'nickName')
      .addSelect('MAX(user.createdAt)', 'createdAt')
      .addSelect('MAX(user.lastLoginAt)', 'lastLoginAt')
      .addSelect(`MAX (CASE WHEN orders.type = 'BUY' THEN orders.createdAt ELSE NULL END)`, 'lastBuyOrder')
      .addSelect(`MAX (CASE WHEN orders.type = 'SELL' THEN orders.createdAt ELSE NULL END)`, 'lastSellOrder')
      .addSelect('MAX(orders.createdAt)', 'lastTradeAt')
      .andWhere('user.id = :userId', { userId })
      .groupBy('user.id');
    return queryBuilder.getRawOne();
  }

  public async lockUserPessimistic(userId: string) {
    return this.createQueryBuilder('user')
      .useTransaction(true)
      .setLock('pessimistic_write')
      .where('user.id = :userId', { userId })
      .getOne();
  }

  protected buildQuery() {
    return this.createQueryBuilder('user')
      .withDeleted()
      .leftJoinAndSelect('user.userInfo', 'userInfo')
      .leftJoinAndSelect('user.merchantOperators', 'merchantOperator')
      .leftJoinAndSelect('user.masterDataLevel', 'masterDataLevel')
      .leftJoinAndSelect('user.statistic', 'statistic')
      .leftJoinAndSelect('user.merchantManager', 'merchantManager');
  }
}
