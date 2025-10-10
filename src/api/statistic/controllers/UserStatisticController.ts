import { JsonController, Get, CurrentUser, Res, Post, Body } from 'routing-controllers';
import { ControllerBase } from '@api/infrastructure/abstracts/ControllerBase';
import { Response } from '@base/decorators/Response';
import { User } from '@api/profile/models/User';
import * as express from 'express';
import { UserAuthorized } from '@api/auth/services/UserAuthorized';
import { UserStatisticResponse } from '@api/statistic/responses/UserStatisticResponse';
import { GetStatisticByUserUseCase } from '@api/statistic/usecase/GetStatisticByUserUseCase';
import { ExportReportRequest } from '@api/statistic/requests/ExportReportRequest';
import { ExportReportUseCase } from '@api/statistic/usecase/ExportReportUseCase';
import { SuccessResponse } from '@api/common/responses/SuccessResponse';
import { RefreshStatisticByUserUseCase } from '@api/statistic/usecase/RefreshStatisticByUserUseCase';
import { UseUserRateLimitMiddleware } from '@api/middlewares/local/UserRateLimitMiddleware';

@UserAuthorized()
@JsonController('/statistic')
export class UserStatisticController extends ControllerBase {
  constructor(
    private getStatisticByUserUseCase: GetStatisticByUserUseCase,
    private exportReportUseCase: ExportReportUseCase,
    private refreshStatisticByUserUseCase: RefreshStatisticByUserUseCase
  ) {
    super();
  }

  @Get('/overview')
  @Response(UserStatisticResponse)
  public async getDataDashboardByUserId(@CurrentUser({ required: true }) currentUser: User) {
    return await this.getStatisticByUserUseCase.getStatistic(currentUser);
  }

  @Post('/export-report')
  @Response(Object)
  public async exportOrderHistory(
    @Body() exportReportRequest: ExportReportRequest,
    @CurrentUser({ required: true }) currentUser: User,
    @Res() res: express.Response
  ) {
    return await this.exportReportUseCase.exportReport(exportReportRequest, currentUser, res);
  }

  @UseUserRateLimitMiddleware()
  @Get('/refresh-statistic')
  @Response(SuccessResponse)
  public async refreshStatistic(
    @CurrentUser({ required: true }) currentUser: User
  ) {
    return await this.refreshStatisticByUserUseCase.refreshStatisticByUserUseCase(currentUser);
  }
}
