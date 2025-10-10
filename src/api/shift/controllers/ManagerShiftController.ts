import { MerchantAuthorized } from '@api/auth/services/MerchantAuthorized';
import { MERCHANT_ROLE_TYPE } from '@api/common/models';
import { ControllerBase } from '@api/infrastructure/abstracts/ControllerBase';
import { Operation } from '@api/profile/models/Operation';
import { ManagerGetShiftsRequest } from '@api/shift/requests/ManagerGetShiftsRequest';
import { ShiftResponse } from '@api/shift/responses/ShiftResponse';
import { ManagerGetShiftsUseCase } from '@api/shift/usecases/ManagerGetShiftsUseCase';
import { PaginationResponse, Response } from '@base/decorators/Response';
import * as express from 'express';
import { Body, CurrentUser, Get, JsonController, Param, Post, Put, QueryParams, Res } from 'routing-controllers';
import { ApproveShiftRequest } from '../requests/ApproveShiftRequest';
import { ExportReportRequest } from '../requests/ExportReportRequest';
import { ApproveShiftUseCase } from '../usecases/ApproveShiftUseCase';
import { ExportShiftReportUseCase } from '../usecases/ExportShiftReportUseCase';
import { EmptyResponse } from '@api/common/responses/EmptyResponse';

@JsonController('/shifts/manager')
export class ManagerShiftController extends ControllerBase {
  constructor(
    private readonly managerGetShiftsUseCase: ManagerGetShiftsUseCase,
    private readonly approveShiftUseCase: ApproveShiftUseCase,
    private readonly exportShiftReportUseCase: ExportShiftReportUseCase
  ) {
    super();
  }

  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_MANAGER])
  @Get('/get-list-shift')
  @PaginationResponse(ShiftResponse)
  public async getShiftsByManager(
    @CurrentUser({ required: true }) manager: Operation,
    @QueryParams() queryParams: ManagerGetShiftsRequest
  ) {
    return await this.managerGetShiftsUseCase.getShiftsByManager(manager, queryParams);
  }

  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_MANAGER])
  @Put('/approve-shift/:shiftId')
  @Response(EmptyResponse)
  public async approveShift(@CurrentUser({ required: true }) currentUser: Operation, @Param('shiftId') shiftId: string) {
    return await this.approveShiftUseCase.approveByShiftId(currentUser, shiftId);
  }

  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_MANAGER])
  @Put('/approve-shifts')
  @Response(EmptyResponse)
  public async approveShifts(@CurrentUser({ required: true }) currentUser: Operation, @Body() request: ApproveShiftRequest) {
    return await this.approveShiftUseCase.approveShifts(currentUser, request);
  }

  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_MANAGER])
  @Post('/export-report')
  @Response(Object)
  public async exportShiftReport(
    @CurrentUser({ required: true }) currentUser: Operation,
    @Body() exportReportRequest: ExportReportRequest,
    @Res() res: express.Response
  ) {
    return await this.exportShiftReportUseCase.exportShiftReport(currentUser.id, exportReportRequest, res);
  }
}
