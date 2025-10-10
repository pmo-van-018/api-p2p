import { EntityRepository } from 'typeorm';
import { RepositoryBase } from '@api/infrastructure/abstracts/RepositoryBase';
import { SupportRequest } from '@api/support-request/models/SupportRequest';
import {
  SupportRequestSortField,
  SupportRequestSearchType,
  SupportRequestStatus,
  SupportRequestQueryStatus
} from '@api/support-request/models/SupportRequestEnum';
import { SupportRequestQuery } from '@api/support-request/types/SupportRequest';

@EntityRepository(SupportRequest)
export class SupportRequestRepository extends RepositoryBase<SupportRequest> {
  public getSupportRequests(supportRequestList: SupportRequestQuery) {
    const queryBuilder = this.createQueryBuilder('supportRequest')
      .leftJoinAndSelect('supportRequest.user', 'user')
      .leftJoinAndSelect('supportRequest.admin', 'admin')
      .offset(supportRequestList.limit * (supportRequestList.page - 1))
      .limit(supportRequestList.limit);

    if (supportRequestList.status === SupportRequestQueryStatus.PENDING) {
      queryBuilder.andWhere('supportRequest.status = :status', { status: SupportRequestQueryStatus.PENDING });
      if (supportRequestList.adminId) {
        queryBuilder.andWhere('supportRequest.adminId IS NULL');
      }
    }

    if (supportRequestList.status === SupportRequestQueryStatus.PROCESSING) {
      queryBuilder.andWhere('supportRequest.status = :status', { status: SupportRequestQueryStatus.PENDING });
      queryBuilder.andWhere('supportRequest.adminId = :adminId', { adminId: supportRequestList.adminId });
    }

    if (supportRequestList.status === SupportRequestQueryStatus.COMPLETED) {
      queryBuilder.andWhere('supportRequest.status = :status', { status: SupportRequestQueryStatus.COMPLETED });
      if (supportRequestList.adminId) {
        queryBuilder.andWhere('supportRequest.adminId = :adminId', { adminId: supportRequestList.adminId });
      }
    }

    if (supportRequestList.type) {
      queryBuilder.andWhere('supportRequest.type = :type', { type: supportRequestList.type });
    }

    if (supportRequestList.searchValue && supportRequestList.searchField) {
      if (supportRequestList.searchField === SupportRequestSearchType.REF_ID) {
        queryBuilder.andWhere('supportRequest.refId = :refId', { refId: supportRequestList.searchValue });
      } else if (supportRequestList.searchField === SupportRequestSearchType.NICK_NAME) {
        queryBuilder.andWhere('user.nickName LIKE :nickName', { nickName: `%${supportRequestList.searchValue}%` });
      } else if (supportRequestList.searchField === SupportRequestSearchType.ADMIN_NICK_NAME) {
        queryBuilder.andWhere('admin.nickName LIKE :nickName', { nickName: `%${supportRequestList.searchValue}%` });
      }
    }

    if (supportRequestList.createdFrom && supportRequestList.createdTo) {
      queryBuilder.andWhere('supportRequest.createdAt BETWEEN :from AND :to', {
        from: supportRequestList.createdFrom,
        to: supportRequestList.createdTo,
      });
    } else if (supportRequestList.createdFrom) {
      queryBuilder.andWhere('supportRequest.createdAt >= :from', {
        from: supportRequestList.createdFrom,
      });
    } else if (supportRequestList.createdTo) {
      queryBuilder.andWhere('supportRequest.createdAt <= :to', {
        to: supportRequestList.createdTo,
      });
    }

    if (supportRequestList.completedFrom && supportRequestList.completedTo) {
      queryBuilder.andWhere('supportRequest.completedAt BETWEEN :from AND :to', {
        from: supportRequestList.completedFrom,
        to: supportRequestList.completedTo,
      });
    }

    if (supportRequestList.received === true) {
      queryBuilder.andWhere('supportRequest.adminId IS NOT NULL');
    }
    if (supportRequestList.received === false) {
      queryBuilder.andWhere('supportRequest.adminId IS NULL');
    }

    if (supportRequestList.sortField === SupportRequestSortField.COMPLETE_TIME) {
      queryBuilder.orderBy('supportRequest.completedAt', supportRequestList.sortType === 'ASC' ? 'ASC' : 'DESC');
    } else {
      queryBuilder.orderBy('supportRequest.createdAt', supportRequestList.sortType === 'DESC' ? 'DESC' : 'ASC');
    }

    return queryBuilder.getManyAndCount();
  }

  public countSupportRequestReceivedByAdminIds(adminIds: string[]) {
    return this.createQueryBuilder('sp')
      .select('COUNT(sp.id)', 'count')
      .addSelect('sp.adminId', 'adminSupporterId')
      .where('sp.adminId IN (:...adminIds)', { adminIds })
      .andWhere('sp.status = :status', { status: SupportRequestStatus.COMPLETED })
      .groupBy('sp.adminId')
      .getRawMany();
  }

  public countPendingByAdmin(includeReceived: boolean) {
    const queryBuilder = this.createQueryBuilder('supportRequest')
      .where('supportRequest.status = :status', { status: SupportRequestStatus.PENDING });
    if (!includeReceived) {
      queryBuilder.andWhere('supportRequest.adminId IS NULL');
    }
    return queryBuilder.getCount();
  }
}
