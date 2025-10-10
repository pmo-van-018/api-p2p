import { RepositoryBase } from '@api/infrastructure/abstracts/RepositoryBase';
import { Notification } from '@api/notification/models/Notification';
import { PaginationResult } from '@api/common/types';
import { EntityRepository } from 'typeorm';
import { NotificationQuery } from '@api/notification/types/Notification';

@EntityRepository(Notification)
export class NotificationRepository extends RepositoryBase<Notification> {
  public getNotificationListByUserId(
    { userId, operationId, status, type, limit, page }: NotificationQuery
  ): Promise<PaginationResult<Notification>> {
    const queryBuilder = this.buildQuery();

    if (userId) {
      queryBuilder.andWhere('notificationUser.userId = (:userId)', {
        userId,
      });
    }
    if (operationId) {
      queryBuilder.andWhere('notificationUser.operationId = (:operationId)', {
        operationId,
      });
    }
    if (status !== undefined && status !== null) {
      queryBuilder.andWhere('notificationUser.status = (:status)', {
        status,
      });
    }
    if (type) {
      queryBuilder.andWhere('notification.type = (:type)', {
        type,
      });
    }
    this.buildPagination(queryBuilder, { limit, page });
    queryBuilder.orderBy('notification.createdAt', 'DESC');
    return queryBuilder.getManyAndCount().then(([items, totalItems]) => ({ items, totalItems }));
  }
  public countNotificationUnreadByNotificationType(userId: string, type?: number): Promise<number> {
    const queryBuilder = this.buildQuery();
    queryBuilder.andWhere('(notificationUser.userId = (:userId) OR notificationUser.operationId = (:userId))', {
      userId,
    });
    queryBuilder.andWhere('notificationUser.status = 0');
    if (type) {
      queryBuilder.andWhere('notification.type = (:type)', {
        type,
      });
    }
    return queryBuilder.getCount();
  }
  public countNotificationByType({ userId, operationId }: { userId?: string, operationId?: string }): Promise<{ type: number; total: number }[]> {
    const queryBuilder = this.buildQuery();
    queryBuilder.select('notification.type', 'type');
    queryBuilder.addSelect('COUNT(notificationUser.id)', 'total');

    if (userId) {
      queryBuilder.andWhere('notificationUser.userId = (:userId)', {
        userId,
      });
    }
    if (operationId) {
      queryBuilder.andWhere('notificationUser.operationId = (:operationId)', {
        operationId,
      });
    }

    queryBuilder.andWhere('notificationUser.status = 0');
    queryBuilder.groupBy('notification.type');
    return queryBuilder.getRawMany();
  }
  public getNotificationById(
    { notificationId, userId, operationId }:
      { notificationId: string, userId?: string, operationId?: string }
  ): Promise<Notification> {
    const queryBuilder = this.buildQuery();
    if (userId) {
      queryBuilder.andWhere('notificationUser.userId = (:userId)', {
        userId,
      });
    }
    if (operationId) {
      queryBuilder.andWhere('notificationUser.operationId = (:operationId)', {
        operationId: userId,
      });
    }

    queryBuilder.andWhere('notification.id = (:notificationId)', {
      notificationId,
    });
    return queryBuilder.getOne();
  }
  public getNotificationWithoutNotificationUser(): Promise<Notification[]> {
    const queryBuilder = this.createQueryBuilder('notification');
    queryBuilder.leftJoin('notification.notificationUsers', 'notificationUser');
    queryBuilder.andWhere('notificationUser.id IS NULL');
    return queryBuilder.getMany();
  }
  private buildQuery() {
    return this.createQueryBuilder('notification').innerJoinAndSelect(
      'notification.notificationUsers',
      'notificationUser'
    );
  }
}
