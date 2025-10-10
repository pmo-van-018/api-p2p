import { ADMIN_ROLE_TYPE } from '@api/common/models/P2PEnum';
import { Operation } from '@api/profile/models/Operation';
import { ControllerBase } from '@api/infrastructure/abstracts/ControllerBase';
import { PaginationResponse, Response } from '@base/decorators/Response';
import { CurrentUser, Get, JsonController, Params, Put, QueryParams } from 'routing-controllers';
import { RefIDParamRequest } from '@api/common/requests/BaseRequest';
import { SupportRequestListRequest } from '@api/support-request/requests/SupportRequestListRequest';
import { CountSupportRequestResponse } from '@api/support-request/responses/CountSupportRequestListResponse';
import { GetSupportRequestDetailResponse } from '@api/support-request/responses/GetSupportRequestDetailResponse';
import { AdminAuthorized } from '@api/auth/services/AdminAuthorized';
import { GetSupportRequestsUseCase } from '@api/support-request/usecase/GetSupportRequestsUseCase';
import { CountReceivedSupportRequestUseCase } from '@api/support-request/usecase/CountReceivedSupportRequestUseCase';
import { ReceiveSupportRequestUseCase } from '@api/support-request/usecase/ReceiveSupportRequestUseCase';
import { ResolveSupportRequestUseCase } from '@api/support-request/usecase/ResolveSupportRequestUseCase';
import { GetSupportRequestDetailUseCase } from '@api/support-request/usecase/GetSupportRequestDetailUseCase';
import { CountPendingRequestUseCase } from '@api/support-request/usecase/CountPendingRequestUseCase';
import { EmptyResponse } from '@api/common/responses/EmptyResponse';
import { AccountStatusResponse } from '@api/support-request/responses/AccountStatusResponse';
import { AccountStatusRequest } from '@api/support-request/requests/AccountStatusRequest';
import { GetUserStatusUseCase } from '@api/support-request/usecase/GetUserStatusUseCase';

@JsonController('/support-requests/admin')
export class AdminSupportRequestController extends ControllerBase {
  constructor(
    private getSupportRequestsUseCase: GetSupportRequestsUseCase,
    private countReceivedSupportRequestUseCase: CountReceivedSupportRequestUseCase,
    private countPendingRequestUseCase: CountPendingRequestUseCase,
    private receiveSupportRequestUseCase: ReceiveSupportRequestUseCase,
    private resolveSupportRequestUseCase: ResolveSupportRequestUseCase,
    private getSupportRequestDetailUseCase: GetSupportRequestDetailUseCase,
    private getUserStatusUseCase: GetUserStatusUseCase
  ) {
    super();
  }

  @AdminAuthorized([ADMIN_ROLE_TYPE.ADMIN_SUPPORTER, ADMIN_ROLE_TYPE.SUPER_ADMIN])
  @Get('/get-requests')
  @PaginationResponse(GetSupportRequestDetailResponse)
  public async getSupportRequests(
    @QueryParams() supportRequestList: SupportRequestListRequest,
    @CurrentUser({ required: true }) currentUser: Operation
  ) {
    return await this.getSupportRequestsUseCase.getListRequest(supportRequestList, currentUser);
  }

  @AdminAuthorized([ADMIN_ROLE_TYPE.ADMIN_SUPPORTER, ADMIN_ROLE_TYPE.SUPER_ADMIN])
  @Get('/count-pending-requests')
  @Response(CountSupportRequestResponse)
  public async countSupportRequestPending(@CurrentUser({ required: true }) currentUser: Operation) {
    return await this.countPendingRequestUseCase.countRequest(currentUser);
  }

  @AdminAuthorized([ADMIN_ROLE_TYPE.ADMIN_SUPPORTER])
  @Get('/count-received-requests')
  @Response(CountSupportRequestResponse)
  public async countSupportRequestReceived(@CurrentUser({ required: true }) currentUser: Operation) {
    return await this.countReceivedSupportRequestUseCase.countReceivedRequests(currentUser.id);
  }

  @AdminAuthorized([ADMIN_ROLE_TYPE.ADMIN_SUPPORTER])
  @Put('/receive-request/:id')
  @Response(EmptyResponse)
  public async receiveSupportRequest(
    @CurrentUser({ required: true }) currentUser: Operation,
    @Params() params: RefIDParamRequest
  ) {
    return await this.receiveSupportRequestUseCase.receive(currentUser, params.id);
  }

  @AdminAuthorized([ADMIN_ROLE_TYPE.ADMIN_SUPPORTER])
  @Put('/resolve-request/:id')
  @Response(EmptyResponse)
  public async resolveSupportRequest(
    @CurrentUser({ required: true }) currentUser: Operation,
    @Params() params: RefIDParamRequest
  ) {
    return await this.resolveSupportRequestUseCase.resolve(currentUser, params.id);
  }

  @AdminAuthorized([ADMIN_ROLE_TYPE.ADMIN_SUPPORTER, ADMIN_ROLE_TYPE.SUPER_ADMIN])
  @Get('/get-request/:id')
  @Response(GetSupportRequestDetailResponse)
  public async getSupportRequestById(
    @CurrentUser({ required: true }) currentUser: Operation,
    @Params() params: RefIDParamRequest
  ) {
    return await this.getSupportRequestDetailUseCase.getRequestDetail(currentUser, params.id);
  }

  @AdminAuthorized([ADMIN_ROLE_TYPE.ADMIN_SUPPORTER, ADMIN_ROLE_TYPE.SUPER_ADMIN])
  @Get('/get-user-status')
  @Response(AccountStatusResponse)
  public async getStatus(@QueryParams() query: AccountStatusRequest) {
    return await this.getUserStatusUseCase.getStatus(query.accountIds);
  }
}
