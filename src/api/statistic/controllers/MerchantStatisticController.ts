import {
  Body,
  ContentType,
  CurrentUser,
  Get,
  JsonController,
  Params,
  Post,
  QueryParams,
  Res
} from 'routing-controllers';
import { ControllerBase } from '@api/infrastructure/abstracts/ControllerBase';
import { MERCHANT_ROLE_TYPE } from '@api/common/models';
import { Response } from '@base/decorators/Response';
import { StatisticResponse } from '@api/statistic/responses/StatisticResponse';
import { Operation } from '@api/profile/models/Operation';
import { MerchantAuthorized } from '@api/auth/services/MerchantAuthorized';
import { DashboardResponse } from '@api/statistic/responses/DashboardResponse';
import { GetMerchantBriefStatisticUseCase } from '@api/statistic/usecase/GetMerchantBriefStatisticUseCase';
import { GetMerchantOverviewStatisticUseCase } from '@api/statistic/usecase/GetMerchantOverviewStatisticUseCase';
import { ChartParamsRequest } from '@api/statistic/requests/ChartParamsRequest';
import { ExportChartByMerchantUseCase } from '@api/statistic/usecase/ExportChartByMerchantUseCase';
import { GetChartByMerchantUseCase } from '@api/statistic/usecase/GetChartByMerchantUseCase';
import { RefreshStatisticByOperationUseCase } from '@api/statistic/usecase/RefreshStatisticByOperationUseCase';
import { UUIDParamRequest } from '@api/common/requests/BaseRequest';
import { GetStaffStatisticByManagerUseCase } from '@api/statistic/usecase/GetStaffStatisticByManagerUseCase';
import { ExportReportRequest } from '@api/statistic/requests/ExportReportRequest';
import * as express from 'express';
import { ExportReportUseCase } from '@api/statistic/usecase/ExportReportUseCase';
import { SuccessResponse } from '@api/common/responses/SuccessResponse';
import { UseOperationRateLimitMiddleware } from '@api/middlewares/local/OperationRateLimitMiddleware';

@MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_MANAGER, MERCHANT_ROLE_TYPE.MERCHANT_OPERATOR])
@JsonController('/statistic/merchant')
export class MerchantController extends ControllerBase {
  constructor(
    private getMerchantBriefStatisticUseCase: GetMerchantBriefStatisticUseCase,
    private getMerchantOverviewStatisticUseCase: GetMerchantOverviewStatisticUseCase,
    private getChartByMerchantUseCase: GetChartByMerchantUseCase,
    private exportChartByMerchantUseCase: ExportChartByMerchantUseCase,
    private getStaffStatisticByManagerUseCase: GetStaffStatisticByManagerUseCase,
    private exportReportUseCase: ExportReportUseCase,
    private refreshStatisticByOperationUseCase: RefreshStatisticByOperationUseCase
  ) {
    super();
  }
  @Get('/')
  @Response(StatisticResponse)
  public async getStatistics(@CurrentUser({ required: true }) currentUser: Operation) {
    return await this.getMerchantBriefStatisticUseCase.getBriefStatistic(currentUser);
  }
  @Get('/overview')
  @Response(DashboardResponse)
  public async getDataDashboardByUserId(@CurrentUser({ required: true }) currentUser: Operation) {
    return await this.getMerchantOverviewStatisticUseCase.getOverviewStatistic(currentUser);
  }

  @Get('/chart')
  @Response(Object)
  public async getVolumes(
    @CurrentUser({ required: true }) currentUser: Operation,
    @QueryParams() chartParamsRequest: ChartParamsRequest
  ) {
    return await this.getChartByMerchantUseCase.getChart(currentUser, chartParamsRequest);
  }

  @Get('/export-chart')
  @Response(Object)
  @ContentType('text/csv')
  public async exportChart(
    @CurrentUser({ required: true }) currentUser: Operation,
    @QueryParams() chartParamsRequest: ChartParamsRequest
  ) {
    return await this.exportChartByMerchantUseCase.exportChart(currentUser, chartParamsRequest);
  }

  @Get('/get-staff-statistic/:id')
  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_MANAGER])
  @Response(DashboardResponse)
  public async getStaffDashboard(
    @CurrentUser({ required: true }) currentUser: Operation,
    @Params() params: UUIDParamRequest
  ) {
    return await this.getStaffStatisticByManagerUseCase.getStatistic(currentUser, params.id);
  }

  @Post('/export-report')
  @Response(Object)
  public async exportOrderHistory(
    @Body() exportReportRequest: ExportReportRequest,
    @CurrentUser({ required: true }) currentUser: Operation,
    @Res() res: express.Response
  ) {
    return await this.exportReportUseCase.exportReport(exportReportRequest, currentUser, res);
  }

  @UseOperationRateLimitMiddleware()
  @Get('/refresh-statistic')
  @Response(SuccessResponse)
  public async refreshStatistic(
    @CurrentUser({ required: true }) currentUser: Operation
  ) {
    return await this.refreshStatisticByOperationUseCase.refreshStatisticByOperation(currentUser);
  }
}
