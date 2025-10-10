import { Appeal, AppealStatus, BUY_APPEAL_RESULTS } from '@api/appeal/models/Appeal';
import { AdminFindConditions } from '@api/appeal/types/Appeal';
import { AppealPendingStaffs } from '@api/appeal/types/Appeal';
import { RepositoryBase } from '@api/infrastructure/abstracts/RepositoryBase';
import { OrderStatus } from '@api/order/models/Order';
import { EntityRepository } from 'typeorm';

@EntityRepository(Appeal)
export class AppealRepository extends RepositoryBase<Appeal> {
  public async getListAppeal(findConditions: AdminFindConditions): Promise<[Appeal[], number]> {
    const queryBuilder = this.createQueryBuilder('appeal')
      .innerJoinAndSelect('appeal.order', 'order')
      .leftJoinAndSelect('appeal.admin', 'admin')
      .innerJoinAndSelect('order.fiat', 'fiat')
      .innerJoinAndSelect('order.asset', 'asset')
      .innerJoinAndSelect('order.user', 'user')
      .innerJoinAndSelect('order.merchant', 'merchant')
      .innerJoinAndSelect('merchant.merchantManager', 'merchantManager');
    if (findConditions.appealStatus?.length) {
      queryBuilder.andWhere('appeal.status IN(:...appealStatus)', { appealStatus: findConditions.appealStatus });
    }
    if (findConditions.adminId) {
      queryBuilder.andWhere('appeal.adminId = :adminId', { adminId: findConditions.adminId });
    }
    if (findConditions.adminId === null) {
      queryBuilder.andWhere('appeal.adminId IS NULL');
    }
    if (findConditions.orderStatus?.length) {
      queryBuilder.andWhere('order.status IN(:...orderStatus)', { orderStatus: findConditions.orderStatus });
    }
    if (findConditions.orderType) {
      queryBuilder.andWhere('order.type = :orderType', { orderType: findConditions.orderType });
    }
    if (findConditions.assetId) {
      queryBuilder.andWhere('order.assetId = :assetId', { assetId: findConditions.assetId });
    }
    if (findConditions.searchField && findConditions.searchValue) {
      const query = {
        orderId: 'order.refId = :search',
        totalPrice: '(TRUNCATE(order.totalPrice, 0) <= TRUNCATE(:search, 0))',
      };
      queryBuilder.andWhere(query[findConditions.searchField] || query['orderId'], {
        search: `${findConditions.searchValue}`,
      });
    }
    if (findConditions.sortField && findConditions.sortDirection) {
      const sort = {
        amount: 'order.amount',
        updatedAt: 'order.updatedAt',
        createdAt: 'order.createdAt',
      };
      queryBuilder.addOrderBy(sort[findConditions.sortField] || sort.amount, findConditions.sortDirection.toUpperCase() as any);
    }
    this.buildPagination(queryBuilder, { limit: findConditions.limit, page: findConditions.page });
    return queryBuilder.getManyAndCount();
  }
  public async getParticipantsByAppealId(appealId: string): Promise<Appeal> {
    return this.createQueryBuilder('appeal')
      .innerJoinAndSelect('appeal.order', 'order')
      .innerJoinAndSelect('order.user', 'user')
      .innerJoinAndSelect('order.merchant', 'merchant')
      .innerJoinAndSelect('merchant.merchantManager', 'merchantManager')
      .leftJoinAndSelect('order.supporter', 'supporter')
      .where('appeal.id = :appealId', { appealId })
      .getOne();
  }

  public async getDetailAppeal(appealId: string): Promise<Appeal> {
    return this.createQueryBuilder('appeal')
      .innerJoinAndSelect('appeal.order', 'order')
      .leftJoinAndSelect('appeal.admin', 'admin')
      .leftJoinAndSelect('order.cryptoTransactions', 'cryptoTransaction')
      .leftJoinAndSelect('order.paymentMethod', 'paymentMethod')
      .leftJoinAndSelect('paymentMethod.paymentMethodFields', 'paymentMethodField')
      .innerJoinAndSelect('order.fiat', 'fiat')
      .innerJoinAndSelect('order.post', 'post')
      .innerJoinAndSelect('order.asset', 'asset')
      .innerJoinAndSelect('order.user', 'user')
      .innerJoinAndSelect('order.merchant', 'merchant')
      .innerJoinAndSelect('merchant.merchantManager', 'merchantManager')
      .where('appeal.id = :appealId', { appealId })
      .getOne();
  }
  public async countOpenAppeal(unassignedOnly: boolean): Promise<number> {
    const queryBuilder = this.createQueryBuilder('appeal')
      .innerJoinAndSelect('appeal.order', 'order')
      .andWhere('appeal.status = :appealStatus', { appealStatus: AppealStatus.OPEN })
      .andWhere('order.status IN(:...orderStatus)', { orderStatus: [OrderStatus.TO_BE_PAID, OrderStatus.PAID, OrderStatus.CONFIRM_PAID] });
    if (unassignedOnly) {
      queryBuilder.andWhere('appeal.adminId IS NULL');
    }
    return queryBuilder.getCount();
  }
  public async countAppealByStaffIds(merchantIds: string[]): Promise<AppealPendingStaffs[]> {
    return this.createQueryBuilder('appeal')
      .innerJoin('appeal.order', 'order')
      .select('order.merchantId', 'merchantId')
      .addSelect('COUNT(appeal.id)', 'appealCount')
      .andWhere('appeal.status = :appealStatus', { appealStatus: AppealStatus.OPEN })
      .andWhere('order.merchantId IN (:...merchantIds) ', { merchantIds })
      .andWhere('appeal.decision_result IS NULL')
      .groupBy('order.merchantId')
      .getRawMany();
  }

  public async clearSecretKeyOfClosedAppealAfterDays(days: number): Promise<void> {
    await this.createQueryBuilder('appeal')
      .update()
      .set({ secret: null })
      .where('status = :status', { status: AppealStatus.CLOSE })
      .andWhere('actualCloseAt < DATE_SUB(NOW(), INTERVAL :days DAY)', { days })
      .execute();
  }

  public async countAppealByManagerId(managerId: string): Promise<number> {
    return this.createQueryBuilder('appeal')
      .innerJoin('appeal.order', 'order')
      .where('appeal.decisionResult != :decisionResult', { decisionResult: BUY_APPEAL_RESULTS.BUY_NOWIN_CANCEL_EVIDENT_NOT_APPROVED })
      .andWhere('appeal.adminId IS NOT NULL')
      .andWhere(
        `order.merchantId IN (select operation.id from operations operation
          WHERE operation.merchant_manager_id = :managerId)`,
        {
          managerId,
        }
      )
      .andWhere('order.status IN(:...orderStatus)', { orderStatus: [OrderStatus.COMPLETED, OrderStatus.CANCELLED] })
      .getCount();
  }

  public async countAppealByOperatorId(operatorId: string): Promise<number> {
    return this.createQueryBuilder('appeal')
      .innerJoin('appeal.order', 'order')
      .where('appeal.decisionResult != :decisionResult', { decisionResult: BUY_APPEAL_RESULTS.BUY_NOWIN_CANCEL_EVIDENT_NOT_APPROVED })
      .andWhere('appeal.adminId IS NOT NULL')
      .andWhere(`order.merchantId = :operatorId`, { operatorId })
      .andWhere('order.status IN(:...orderStatus)', { orderStatus: [OrderStatus.COMPLETED, OrderStatus.CANCELLED] })
      .getCount();
  }
}
