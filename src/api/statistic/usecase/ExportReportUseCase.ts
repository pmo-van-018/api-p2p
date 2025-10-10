import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import * as express from 'express';
import moment from 'moment';
import { MAX_MONTH_REPORT } from '@api/order/constants/order';
import { StatisticError } from '@api/statistic/errors/StatisticError';
import { SharedOrderService } from '@api/order/services/order/SharedOrderService';
import {
  exportFile,
  exportUserStatisticReport
} from '@base/utils/report.util';
import { ReadStream } from 'typeorm/platform/PlatformTools';
import { Operation } from '@api/profile/models/Operation';
import {OperationType, ReportType, StaffType} from '@api/common/models';
import { ExportReportRequest } from '@api/statistic/requests/ExportReportRequest';
import { SharedPostService } from '@api/post/services/SharedPostService';
import { SharedProfileService } from '@api/profile/services/SharedProfileService';
import { env } from '@base/env';
import { SharedReferralService } from '@api/referral/services/SharedReferralService';
import { SharedResourceService } from '@api/master-data/services/SharedResourceService';
import {
  ORDER_HISTORY_FILE,
  ASSET_HISTORY_FILE,
  POST_HISTORY_FILE,
  REVENUE_MANAGER_FILE,
  STATISTIC_MANAGER_FILE, STATISTIC_STAFF_FILE
} from '@api/constant/report';
import { User } from '@api/profile/models/User';

@Service()
export class ExportReportUseCase {
  constructor(
    private sharedOrderService: SharedOrderService,
    private sharedPostService: SharedPostService,
    private sharedOperationService: SharedProfileService,
    private sharedReferralService: SharedReferralService,
    private sharedResourceService: SharedResourceService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async exportReport(filter: ExportReportRequest, currentUser: Operation | User, response: express.Response) {
    this.log.debug(`Start implement exportReport: ${currentUser.id}`);
    filter.startDate = moment(filter.startDate).utc().format('YYYY-MM-DD HH:mm:ss');
    filter.endDate = moment(filter.endDate).utc().format('YYYY-MM-DD HH:mm:ss');
    const duringTime = moment(filter.endDate).diff(filter.startDate, 'months', false);
    if (duringTime > MAX_MONTH_REPORT) {
      return StatisticError.REPORT_TIME_INVALID;
    }
    if (!this.validateExportReportPermission(filter, currentUser)) {
      return StatisticError.REPORT_PERMISSION_DENIED;
    }
    if (filter.reportType === ReportType.USER_STATISTIC) {
      const [assets, orderStatistics, userInfo, totalReferred] = await Promise.all([
        this.sharedResourceService.getAssets(),
        this.sharedOrderService.getUserOrderStatistic(filter.userId),
        this.sharedOperationService.getUserById(filter.userId),
        env.referral.enable ? this.sharedReferralService.countTotalReferredByInviterId(filter.userId) : Promise.resolve(null),
      ]);

      if (!userInfo) {
        return StatisticError.USER_NOT_FOUND;
      }
      return exportUserStatisticReport(assets, orderStatistics, userInfo, filter.fileFormat, response, totalReferred);
    }
    const queryStream = await this.getReportData(filter, currentUser);
    const result = await this.exportReportData(queryStream, currentUser, filter, response);
    this.log.debug(`Stop implement exportReport: ${currentUser.id}`);
    return result;
  }

  private validateExportReportPermission(filter: ExportReportRequest, currentUser: Operation | User) {
    const roles: number[] = [
      OperationType.MERCHANT_MANAGER,
      OperationType.MERCHANT_OPERATOR,
      OperationType.SUPER_ADMIN,
    ];
    const adminReports = [ReportType.REVENUE, ReportType.MANAGER_STATISTIC, ReportType.USER_STATISTIC];
    const managerReports = [ReportType.STAFF_STATISTIC];
    if (adminReports.includes(filter.reportType) && currentUser.type !== OperationType.SUPER_ADMIN) {
      return false;
    }
    if (filter.reportType === ReportType.POST_HISTORIES && !roles.includes(currentUser.type)) {
      return false;
    }
    if (managerReports.includes(filter.reportType) && currentUser.type !== OperationType.MERCHANT_MANAGER) {
      return false;
    }
    return true;
  }

  private getReportData(filter: ExportReportRequest, currentUser: Operation | User) {
    switch (filter.reportType) {
      case ReportType.ORDER_HISTORIES:
        return this.sharedOrderService.getOrderHistoryReport(filter, currentUser);
      case ReportType.ASSET:
        return this.sharedOrderService.getAssetRevenueReport(filter, currentUser);
      case ReportType.TRADE_TYPE_DIFFERENCE:
        return this.sharedOrderService.getTradeTypeDifference(filter, currentUser);
      case ReportType.POST_HISTORIES:
        return this.sharedPostService.getPostHistoryReport(filter, currentUser as Operation);
      case ReportType.REVENUE:
        return this.sharedOperationService.getRevenueData(filter);
      case ReportType.MANAGER_STATISTIC:
        return this.sharedOperationService.getManagerStatistic(filter);
      case ReportType.STAFF_STATISTIC:
        if (filter.staffType === StaffType.SUPPORTER) {
          return this.sharedOperationService.getSupporterStatistic(currentUser.id);
        }
        return this.sharedOperationService.getOperatorStatistic(currentUser.id);
      case ReportType.USER_STATISTIC:
      default: return null;
    }
  }

  private async exportReportData(queryStream: ReadStream, user: Operation | User, filter: ExportReportRequest, response: express.Response) {
    let totalAmount: 0;
    let totalAssets: any[];
    let totalOrder = 0;
    let filename = '';
    let isOperator = true;
    switch (filter.reportType) {
      case ReportType.ORDER_HISTORIES:
        filename = ORDER_HISTORY_FILE;
        break;
      case ReportType.ASSET:
        totalAmount = await this.sharedOrderService.getRevenueAllAsset(filter, user);
        filename = ASSET_HISTORY_FILE;
        break;
      case ReportType.TRADE_TYPE_DIFFERENCE:
        totalAssets = await this.sharedOrderService.getRevenueAllAsset(filter, user, true);
        filename = ASSET_HISTORY_FILE;
        break;
      case ReportType.POST_HISTORIES:
        filename = POST_HISTORY_FILE;
        break;
      case ReportType.REVENUE:
        filename = REVENUE_MANAGER_FILE;
        break;
      case ReportType.MANAGER_STATISTIC:
        filename = STATISTIC_MANAGER_FILE;
        break;
      case ReportType.STAFF_STATISTIC:
        if (filter.staffType === StaffType.SUPPORTER) {
          totalOrder = await this.sharedOrderService.countOrderAppeal(user.id);
          isOperator = false;
        }
        filename = STATISTIC_STAFF_FILE;
        break;
      default: return null;
    }
    return exportFile(
      queryStream,
      filter.reportType,
      user.type,
      filter.fileFormat,
      filename, response,
      { totalAmount, totalAssets, totalOrder, isOperator }
    );
  }
}
