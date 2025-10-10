import { Body, ContentType, CurrentUser, Get, JsonController, Params, Post, QueryParams, Res } from 'routing-controllers';
import { ControllerBase } from '@api/infrastructure/abstracts/ControllerBase';
import { DashboardResponse } from '@api/statistic/responses/DashboardResponse';
import { Response } from '@base/decorators/Response';
import { ChartParamsRequest } from '@api/statistic/requests/ChartParamsRequest';
import { ADMIN_ROLE_TYPE } from '@api/common/models/P2PEnum';
import { Operation } from '@api/profile/models/Operation';
import { TradingVolumeByPeriodRequest } from '../requests/TradingVolumeByPeriodRequest';
import { TradingVolumeByPeriodResponse } from '../responses/TradingVolumeByPeriodResponse';
import { RevenueAndPriceByPeriodRequest } from '../requests/RevenueAndPriceByPeriodRequest';
import { RevenueAndPriceByPeriodResponse } from '../responses/RevenueAndPriceByPeriodResponse';
import { AdminAuthorized } from '@api/auth/services/AdminAuthorized';
import { GetAdminOverviewStatisticUseCase } from '@api/statistic/usecase/GetAdminOverviewStatisticUseCase';
import { ExportChartByAdminUseCase } from '@api/statistic/usecase/ExportChartByAdminUseCase';
import { GetChartByAdminUseCase } from '@api/statistic/usecase/GetChartByAdminUseCase';
import { GetTradingVolumeByPeriodUseCase } from '@api/statistic/usecase/GetTradingVolumeByPeriodUseCase';
import { GetRevenueByPeriodUseCase } from '@api/statistic/usecase/GetRevenueByPeriodUseCase';
import { UUIDParamRequest } from '@api/common/requests/BaseRequest';
import { GetMerchantOverviewStatisticByAdminUseCase } from '@api/statistic/usecase/GetMerchantOverviewStatisticByAdminUseCase';
import { GetUserOverviewStatisticByAdminUseCase } from '@api/statistic/usecase/GetUserOverviewStatisticByAdminUseCase';
import { UserBriefStatisticResponse } from '@api/statistic/responses/UserBriefStatisticResponse';
import { ExportReportRequest } from '@api/statistic/requests/ExportReportRequest';
import * as express from 'express';
import { ExportReportUseCase } from '@api/statistic/usecase/ExportReportUseCase';
import { SuccessResponse } from '@api/common/responses/SuccessResponse';
import { RefreshStatisticByAdminUseCase } from '../usecase/RefreshStatisticByAdminUseCase';
import { UseOperationRateLimitMiddleware } from '@api/middlewares/local/OperationRateLimitMiddleware';

@JsonController('/statistic/admin')
@AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN, ADMIN_ROLE_TYPE.ADMIN_SUPPORTER])
export class AdminStatisticController extends ControllerBase {
  constructor(
    private getTradingVolumeByPeriodUseCase: GetTradingVolumeByPeriodUseCase,
    private getAdminOverviewStatisticUseCase: GetAdminOverviewStatisticUseCase,
    private exportChartByAdminUseCase: ExportChartByAdminUseCase,
    private getChartByAdminUseCase: GetChartByAdminUseCase,
    private getRevenueByPeriodUseCase: GetRevenueByPeriodUseCase,
    private getMerchantOverviewStatisticByAdminUseCase: GetMerchantOverviewStatisticByAdminUseCase,
    private getUserOverviewStatisticByAdminUseCase: GetUserOverviewStatisticByAdminUseCase,
    private exportReportUseCase: ExportReportUseCase,
    private refreshStatisticByAdminUseCase: RefreshStatisticByAdminUseCase
  ) {
    super();
  }

  @Get('/overview')
  @Response(DashboardResponse)
  @AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN])
  public async getDataDashboardByUserId(@CurrentUser({ required: true }) currentUser: Operation) {
    return await this.getAdminOverviewStatisticUseCase.getOverviewStatistic(currentUser);
  }

  @Get('/export-chart')
  @Response(Object)
  @ContentType('text/csv')
  @AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN])
  public async exportChart(
    @CurrentUser({ required: true }) currentUser: Operation,
    @QueryParams() chartParamsRequest: ChartParamsRequest
  ) {
    return await this.exportChartByAdminUseCase.exportChart(currentUser, chartParamsRequest);
  }

  @Get('/chart')
  @Response(Object)
  @AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN])
  public async getVolumes(
    @CurrentUser({ required: true }) currentUser: Operation,
    @QueryParams() chartParamsRequest: ChartParamsRequest
  ) {
    return await this.getChartByAdminUseCase.getChart(currentUser, chartParamsRequest);
  }

  @Get('/trading-volume-by-period')
  @Response(TradingVolumeByPeriodResponse)
  @AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN])
  public async getTradingVolumeByPeriod(
    @QueryParams() tradingVolumeByPeriodRequest: TradingVolumeByPeriodRequest
  ) {
    return await this.getTradingVolumeByPeriodUseCase.getTradeVolumes(tradingVolumeByPeriodRequest);
  }

  @Get('/revenue-and-price-by-period')
  @Response(RevenueAndPriceByPeriodResponse)
  @AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN])
  public async getRevenueAndPriceByPeriod(
    @QueryParams() revenueAndPriceByPeriodRequest: RevenueAndPriceByPeriodRequest
  ) {
    return await this.getRevenueByPeriodUseCase.getRevenue(revenueAndPriceByPeriodRequest);
  }

  @Get('/get-merchant-statistic/:id')
  @Response(DashboardResponse)
  @AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN])
  public async getStaffDashboard(@CurrentUser({ required: true }) currentUser: Operation, @Params() params: UUIDParamRequest) {
    return await this.getMerchantOverviewStatisticByAdminUseCase.getOverviewStatistic(currentUser, params.id);
  }

  @Get('/get-user-statistic/:id')
  @Response(UserBriefStatisticResponse)
  @AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN, ADMIN_ROLE_TYPE.ADMIN_SUPPORTER])
  public async getUserDashboardById(@Params() params: UUIDParamRequest) {
    return await this.getUserOverviewStatisticByAdminUseCase.getOverviewStatistic(params.id);
  }

  @Post('/export-report')
  @Response(Object)
  @AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN])
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
    return await this.refreshStatisticByAdminUseCase.refreshStatisticByAdminUseCase(currentUser);
  }
}
