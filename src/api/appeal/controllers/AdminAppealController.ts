import {
  Body,
  CurrentUser,
  Get,
  JsonController,
  Params,
  Post,
  QueryParams
} from 'routing-controllers';
import { ControllerBase } from '@api/infrastructure/abstracts/ControllerBase';
import { ADMIN_ROLE_TYPE } from '@api/common/models/P2PEnum';
import { PaginationResponse, Response } from '@base/decorators/Response';
import { AddExtraTimeAppealRequest } from '@api/appeal/requests/AddExtraTimeAppealRequest';
import { DecisionResultRequest } from '@api/appeal/requests/DecisionResultRequest';
import { AppealDetailResponse } from '@api/appeal/responses/AppealDetailResponse';
import { Operation } from '@api/profile/models/Operation';
import { UUIDParamRequest } from '@api/common/requests/BaseRequest';
import { AppealCountResponse } from '@api/appeal/responses/AppealCountResponse';
import { GetAppealListRequest } from '@api/appeal/requests/GetAppealListRequest';
import { GetAppealListUseCase } from '@api/appeal/usecase/GetAppealListUseCase';
import { AddExtraTimeAppealUseCase } from '@api/appeal/usecase/AddExtraTimeAppealUseCase';
import { DecideAppealSellOrderUseCase } from '@api/appeal/usecase/DecideAppealSellOrderUseCase';
import { DecideAppealBuyOrderUseCase } from '@api/appeal/usecase/DecideAppealBuyOrderUseCase';
import { PickAppealUseCase } from '@api/appeal/usecase/PickAppealUseCase';
import { CancelAppealSessionUseCase } from '@api/appeal/usecase/CancelAppealSessionUseCase';
import { CountOpenAppealUseCase } from '@api/appeal/usecase/CountOpenAppealUseCase';
import { EmptyResponse } from '@api/common/responses/EmptyResponse';
import { AppealListResponse } from '@api/appeal/responses/AppealListResponse';
import { GetAppealDetailUseCase } from '@api/appeal/usecase/GetAppealDetailUseCase';
import { CountPickedAppealUseCase } from '@api/appeal/usecase/CountPickedAppealUseCase';
import { AdminAuthorized } from '@api/auth/services/AdminAuthorized';

@JsonController('/appeals/admin')
export class AdminAppealController extends ControllerBase {
  constructor(
    private getAppealListUseCase: GetAppealListUseCase,
    private getAppealDetailUseCase: GetAppealDetailUseCase,
    private addExtraTimeAppealUseCase: AddExtraTimeAppealUseCase,
    private decideAppealSellOrderUseCase: DecideAppealSellOrderUseCase,
    private decideAppealBuyOrderUseCase: DecideAppealBuyOrderUseCase,
    private pickAppealUseCase: PickAppealUseCase,
    private cancelAppealSessionUseCase: CancelAppealSessionUseCase,
    private countOpenAppealUseCase: CountOpenAppealUseCase,
    private countPickedAppealUseCase: CountPickedAppealUseCase
  ) {
    super();
  }

  @AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN, ADMIN_ROLE_TYPE.ADMIN_SUPPORTER])
  @Get('/list-appeals')
  @PaginationResponse(AppealListResponse)
  public async getAppealList(
    @CurrentUser({ required: true }) currentUser: Operation,
    @QueryParams() getAppealListRequest: GetAppealListRequest
  ) {
    return await this.getAppealListUseCase.getList(currentUser, getAppealListRequest);
  }

  @AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN, ADMIN_ROLE_TYPE.ADMIN_SUPPORTER])
  @Get('/get-appeal-detail/:id')
  @Response(AppealDetailResponse)
  public async getAppealDetail(
    @CurrentUser({ required: true }) currentUser: Operation,
    @Params() params: UUIDParamRequest
  ) {
    return await this.getAppealDetailUseCase.getDetail(currentUser, params.id);
  }

  @AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN, ADMIN_ROLE_TYPE.ADMIN_SUPPORTER])
  @Get('/count-opening-appeal')
  @Response(AppealCountResponse)
  public async countOpenAppeal(@CurrentUser({ required: true }) currentUser: Operation) {
    return await this.countOpenAppealUseCase.countOpenAppeal(currentUser);
  }

  @AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN, ADMIN_ROLE_TYPE.ADMIN_SUPPORTER])
  @Get('/count-picked-appeal')
  @Response(AppealCountResponse)
  public async countPickedAppeal(@CurrentUser({ required: true }) currentUser: Operation) {
    return await this.countPickedAppealUseCase.countPickedAppeal(currentUser.id);
  }

  @AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN, ADMIN_ROLE_TYPE.ADMIN_SUPPORTER])
  @Post('/add-extra-time-appeal')
  @Response(EmptyResponse)
  public async addExtraTimeAppeal(
    @CurrentUser({ required: true }) currentUser: Operation,
    @Body() addExtraTimeAppealRequest: AddExtraTimeAppealRequest) {
    return await this.addExtraTimeAppealUseCase.addTimeHandleAppeal(currentUser, addExtraTimeAppealRequest);
  }

  @AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN, ADMIN_ROLE_TYPE.ADMIN_SUPPORTER])
  @Post('/decide-appeal-sell-order')
  @Response(EmptyResponse)
  public async decideAppealSellOrder(
    @CurrentUser({ required: true }) currentUser: Operation,
    @Body() decisionResultRequest: DecisionResultRequest
  ) {
    return await this.decideAppealSellOrderUseCase.decideAppeal(currentUser, decisionResultRequest);
  }

  @AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN, ADMIN_ROLE_TYPE.ADMIN_SUPPORTER])
  @Post('/decide-appeal-buy-order')
  @Response(EmptyResponse)
  public async decideAppealBuyOrder(
    @CurrentUser({ required: true }) currentUser: Operation,
    @Body() decisionResultRequest: DecisionResultRequest
  ) {
    return await this.decideAppealBuyOrderUseCase.decideAppeal(currentUser, decisionResultRequest);
  }

  @AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN, ADMIN_ROLE_TYPE.ADMIN_SUPPORTER])
  @Post('/pick-appeal/:id')
  @Response(EmptyResponse)
  public async pickAppeal(
    @CurrentUser({ required: true }) currentUser: Operation,
    @Params() params: UUIDParamRequest
  ) {
    return await this.pickAppealUseCase.pickAppeal(currentUser, params.id);
  }

  @AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN])
  @Post('/cancel-appeal-session/:id')
  @Response(EmptyResponse)
  public async cancelAppealSession(
    @Params() params: UUIDParamRequest
  ) {
    return await this.cancelAppealSessionUseCase.cancelAppealSession(params.id);
  }
}
