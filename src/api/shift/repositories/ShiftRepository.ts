import { RepositoryBase } from '@api/infrastructure/abstracts/RepositoryBase';
import { Shift, ShiftStatus } from '@api/shift/models/Shift';
import { GetShiftHistoriesRequest } from '@api/shift/requests/GetShiftHistoriesRequest';
import { ManagerGetShiftsRequest } from '@api/shift/requests/ManagerGetShiftsRequest';
import moment from 'moment';
import { EntityRepository, UpdateResult } from 'typeorm';
import { FilterDateType, SearchTextType, ShiftOrderField } from '../enums/ShiftEnum';
import { ExportReportRequest } from '../requests/ExportReportRequest';
import { ShiftCriteria } from '../types/ShiftCriteria';
import { Helper } from '@api/infrastructure/helpers/Helper';

@EntityRepository(Shift)
export class ShiftRepository extends RepositoryBase<Shift> {
  public async getLatestShiftByOperationId(operationId: string): Promise<Shift> {
    return this.createQueryBuilder('shift')
      .where('shift.operationId = :operationId', { operationId })
      .orderBy('shift.createdAt', 'DESC')
      .getOne();
  }

  public async getShiftProcessingByOperatorId(operationId: string): Promise<Shift> {
    return this.createQueryBuilder('shift')
      .where('shift.operationId = :operationId', { operationId })
      .andWhere('shift.status = :status', { status: ShiftStatus.PROCESSING })
      .getOne();
  }

  public async createNewShift(shift: Shift): Promise<Shift> {
    return await this.save(shift);
  }

  public async updateShiftStatus(managerId: string, criteria: ShiftCriteria, status: ShiftStatus): Promise<UpdateResult> {
    return await this.query(
      `
      UPDATE shifts
      INNER JOIN operations operator ON shifts.operation_id = operator.id
      SET shifts.status = ?
      WHERE operator.merchant_manager_id = ? AND
        ( ? IS NULL OR shifts.id = ? )
      AND
        ( ? IS NULL OR shifts.status = ? )
      AND
        ( (? IS NULL OR ? IS NULL) OR ( ? = 'NICK_NAME' AND LOWER(operator.nick_name) LIKE CONCAT('%', LOWER(?), '%') ) OR ( ? = 'WALLET_ADDRESS' AND LOWER(operator.wallet_address) = LOWER(?) ))
      AND
        ( (? IS NULL OR ? IS NULL OR ? IS NULL ) OR ( ? = 'CHECK_IN' AND DATE(shifts.check_in_at)  >= DATE(?) AND DATE(shifts.check_in_at) <= DATE(?) ) OR ( ? = 'CHECK_OUT' AND DATE(shifts.check_out_at) >= DATE(?) AND DATE(shifts.check_out_at) <= DATE(?) ))
      `,
      [
        status,
        managerId,
        criteria.shiftId,
        criteria.shiftId,
        criteria.status,
        criteria.status,
        ...Array(3)
          .fill([criteria.searchTextType, criteria.search])
          .flatMap((item) => item),
        ...Array(3)
          .fill([criteria.filterDateType, criteria.startDate, criteria.endDate])
          .flatMap((item) => item),
      ]
    );
  }

  public async getMyShiftHistories(operationId: string, shiftHistoriesRequest: GetShiftHistoriesRequest) {
    const { startDate, endDate, searchType, limit, page, orderDirection, orderField, status } = shiftHistoriesRequest;
    const queryBuilder = this.createQueryBuilder('shift')
      .addSelect('TIMESTAMPDIFF(SECOND, shift.checkInAt, shift.checkOutAt)', 'diff')
      .where('shift.operationId = :operationId', { operationId })
      .offset(limit * (page - 1))
      .limit(limit);
    if (searchType && startDate && endDate) {
      switch (searchType) {
        case FilterDateType.CHECK_IN:
          queryBuilder.andWhere('DATE(shift.checkInAt) >= DATE(:startDate)', { startDate });
          queryBuilder.andWhere('DATE(shift.checkInAt) <= DATE(:endDate)', { endDate });
          break;
        case FilterDateType.CHECK_OUT:
          queryBuilder.andWhere('DATE(shift.checkOutAt) >= DATE(:startDate)', { startDate });
          queryBuilder.andWhere('DATE(shift.checkOutAt) <= DATE(:endDate)', { endDate });
          break;
        default:
          break;
      }
    }
    if (status) {
      queryBuilder.andWhere('shift.status IN (:...status)', { status: Helper.normalizeStringToArray(status, ',') });
    }
    const sortField = this.getFieldName(orderField);
    const direction = orderDirection === 'ASC' ? 'ASC' : 'DESC';
    queryBuilder.orderBy(sortField, direction);
    return queryBuilder.getManyAndCount();
  }

  public async getShiftDetailByManagerId(managerId: string, shiftId: string): Promise<Shift> {
    return this.createQueryBuilder('shift')
      .innerJoin('shift.operation', 'operation')
      .where('operation.merchantManagerId = :managerId', { managerId })
      .andWhere('shift.id = :shiftId', { shiftId })
      .getOne();
  }

  public async getShiftsByManager(managerId: string, request: ManagerGetShiftsRequest) {
    const {
      startDate,
      endDate,
      searchTextType,
      orderField,
      orderDirection,
      search,
      status,
      filterDateType,
      limit,
      page,
    } = request;

    const queryBuilder = this.createQueryBuilder('shift')
      .innerJoinAndSelect('shift.operation', 'merchant')
      .innerJoinAndSelect('merchant.merchantManager', 'manager')
      .where('manager.id = :managerId', { managerId })
      .addSelect('TIMESTAMPDIFF(SECOND, shift.checkInAt, shift.checkOutAt)', 'diff');

    if (status) {
      queryBuilder.andWhere('shift.status = :status', { status });
    }

    if (searchTextType && search) {
      switch (searchTextType) {
        case SearchTextType.NICK_NAME:
          queryBuilder.andWhere('LOWER(merchant.nickName) LIKE LOWER(:search)', { search: `%${search}%` });
          break;
        case SearchTextType.WALLET_ADDRESS:
          queryBuilder.andWhere('LOWER(merchant.walletAddress) = LOWER(:search)', { search });
          break;
        default:
          break;
      }
    }

    if (filterDateType && startDate && endDate) {
      switch (filterDateType) {
        case FilterDateType.CHECK_IN:
          queryBuilder.andWhere('DATE(shift.checkInAt) >= DATE(:startDate)', { startDate });
          queryBuilder.andWhere('DATE(shift.checkInAt) <= DATE(:endDate)', { endDate });
          break;
        case FilterDateType.CHECK_OUT:
          queryBuilder.andWhere('DATE(shift.checkOutAt) >= DATE(:startDate)', { startDate });
          queryBuilder.andWhere('DATE(shift.checkOutAt) <= DATE(:endDate)', { endDate });
          break;
        default:
          break;
      }
    }

    if (orderField && orderDirection) {
      queryBuilder.orderBy(this.getFieldName(orderField), orderDirection);
    }

    queryBuilder.skip(limit * (page - 1)).take(limit);

    return await queryBuilder.getManyAndCount();
  }

  public async updateShift(shiftId: string, shift: Shift) {
    return await this.update(shiftId, shift);
  }

  public async exportShiftReport(managerId: string, exportReportRequest: ExportReportRequest) {
    const { endDate, operatorIds, startDate } = exportReportRequest;
    const queryBuilder = this.createQueryBuilder('shift')
      .withDeleted()
      .innerJoinAndSelect('shift.operation', 'operation')
      .where('operation.merchantManagerId = :managerId', { managerId })
      .orderBy('shift.checkOutAt', 'DESC');
    if (startDate) {
      queryBuilder.andWhere('shift.checkOutAt >= :startDate', {
        startDate: moment(startDate).utc().format('YYYY-MM-DD HH:mm:ss'),
      });
    }
    if (endDate) {
      queryBuilder.andWhere('shift.checkOutAt <= :endDate', {
        endDate: moment(endDate).utc().format('YYYY-MM-DD HH:mm:ss'),
      });
    }
    if (operatorIds?.length) {
      queryBuilder.andWhere('shift.operationId IN (:...operatorIds)', { operatorIds });
    }
    return queryBuilder.stream();
  }

  private getFieldName(orderField: string) {
    switch (orderField) {
      case ShiftOrderField.checkIn:
        return 'shift.checkInAt';
      case ShiftOrderField.checkOut:
        return 'shift.checkOutAt';
      case ShiftOrderField.orderAmount:
        return 'shift.totalVolume';
      case ShiftOrderField.duringTime:
        return 'diff';
      default:
        return 'shift.checkInAt';
    }
  }
}
