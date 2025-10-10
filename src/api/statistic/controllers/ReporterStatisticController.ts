import { Body, ContentType, CurrentUser, Get, JsonController, Post, QueryParams, Res } from 'routing-controllers';
import { ControllerBase } from '@api/infrastructure/abstracts/ControllerBase';
import { DashboardResponse } from '@api/statistic/responses/DashboardResponse';
import { Response } from '@base/decorators/Response';
import { ExportReportRequest } from '@api/statistic/requests/ExportReportRequest';
import { ChartParamsRequest } from '@api/statistic/requests/ChartParamsRequest';
import { OperationType } from '@api/common/models/P2PEnum';
import { TradingVolumeByPeriodRequest } from '../requests/TradingVolumeByPeriodRequest';
import { TradingVolumeByPeriodResponse } from '../responses/TradingVolumeByPeriodResponse';
import { RevenueAndPriceByPeriodRequest } from '../requests/RevenueAndPriceByPeriodRequest';
import { RevenueAndPriceByPeriodResponse } from '../responses/RevenueAndPriceByPeriodResponse';
import { GetAdminOverviewStatisticUseCase } from '@api/statistic/usecase/GetAdminOverviewStatisticUseCase';
import { ExportChartByAdminUseCase } from '@api/statistic/usecase/ExportChartByAdminUseCase';
import { GetChartByAdminUseCase } from '@api/statistic/usecase/GetChartByAdminUseCase';
import { GetTradingVolumeByPeriodUseCase } from '@api/statistic/usecase/GetTradingVolumeByPeriodUseCase';
import { GetRevenueByPeriodUseCase } from '@api/statistic/usecase/GetRevenueByPeriodUseCase';
import * as express from 'express';
import { ExportReportUseCase } from '@api/statistic/usecase/ExportReportUseCase';
import { ReporterAuthorized } from '@api/auth/services/ReporterAuthorized';
import { UserPassword } from '@api/profile/models/UserPassword';

@JsonController('/statistic/reporter')
@ReporterAuthorized()
export class ReporterStatisticController extends ControllerBase {
  constructor(
    private getTradingVolumeByPeriodUseCase: GetTradingVolumeByPeriodUseCase,
    private getAdminOverviewStatisticUseCase: GetAdminOverviewStatisticUseCase,
    private exportChartByAdminUseCase: ExportChartByAdminUseCase,
    private getChartByAdminUseCase: GetChartByAdminUseCase,
    private getRevenueByPeriodUseCase: GetRevenueByPeriodUseCase,
    private exportReportUseCase: ExportReportUseCase
  ) {
    super();
  }

  @Get('/overview')
  @Response(DashboardResponse)
  public async getDataDashboardByUserId(@CurrentUser({ required: true }) currentUser: UserPassword) {
    return await this.getAdminOverviewStatisticUseCase.getOverviewStatistic({
      ...currentUser,
      type: OperationType.SUPER_ADMIN,
    } as any);
  }

  @Get('/export-chart')
  @Response(Object)
  @ContentType('text/csv')
  public async exportChart(
    @CurrentUser({ required: true }) currentUser: UserPassword,
    @QueryParams() chartParamsRequest: ChartParamsRequest
  ) {
    return await this.exportChartByAdminUseCase.exportChart(
      {
        ...currentUser,
        type: OperationType.SUPER_ADMIN,
      } as any,
      chartParamsRequest
    );
  }

  @Get('/chart')
  @Response(Object)
  public async getVolumes(
    @CurrentUser({ required: true }) currentUser: UserPassword,
    @QueryParams() chartParamsRequest: ChartParamsRequest
  ) {
    return await this.getChartByAdminUseCase.getChart(
      {
        ...currentUser,
        type: OperationType.SUPER_ADMIN,
      } as any,
      chartParamsRequest
    );
  }

  @Get('/trading-volume-by-period')
  @Response(TradingVolumeByPeriodResponse)
  public async getTradingVolumeByPeriod(@QueryParams() tradingVolumeByPeriodRequest: TradingVolumeByPeriodRequest) {
    return await this.getTradingVolumeByPeriodUseCase.getTradeVolumes(tradingVolumeByPeriodRequest);
  }

  @Get('/revenue-and-price-by-period')
  @Response(RevenueAndPriceByPeriodResponse)
  public async getRevenueAndPriceByPeriod(
    @QueryParams() revenueAndPriceByPeriodRequest: RevenueAndPriceByPeriodRequest
  ) {
    return await this.getRevenueByPeriodUseCase.getRevenue(revenueAndPriceByPeriodRequest);
  }

  @Post('/export-report')
  @Response(Object)
  public async exportOrderHistory(
    @Body() exportReportRequest: ExportReportRequest,
    @CurrentUser({ required: true }) currentUser: UserPassword,
    @Res() res: express.Response
  ) {
    return await this.exportReportUseCase.exportReport(
      exportReportRequest,
      { ...currentUser, type: OperationType.SUPER_ADMIN } as any,
      res
    );
  }
}
