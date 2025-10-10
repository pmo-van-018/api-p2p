import { User } from '@api/profile/models/User';
import { ControllerBase } from '@api/infrastructure/abstracts/ControllerBase';
import { CreateSupportRequestsResponse } from '@api/support-request/responses/CreateSupportRequestsResponse';
import { Response } from '@base/decorators/Response';
import {
  Body,
  CurrentUser,
  Get,
  JsonController,
  Post
} from 'routing-controllers';
import { CreateNewSupportRequest } from '@api/support-request/requests/CreateNewSupportRequest';
import { GetSupportRequestUserResponse } from '@api/support-request/responses/GetSupportRequestUserResponse';
import { CreateSupportRequestUseCase } from '@api/support-request/usecase/CreateSupportRequestUseCase';
import { GetPendingSupportRequestUseCase } from '@api/support-request/usecase/GetPendingSupportRequestUseCase';
import { UserAuthorized } from '@api/auth/services/UserAuthorized';

@UserAuthorized()
@JsonController('/support-requests')
export class UserSupportRequestController extends ControllerBase {
  constructor(
    private createSupportRequestUseCase: CreateSupportRequestUseCase,
    private getPendingSupportRequestUseCase: GetPendingSupportRequestUseCase
  ) {
    super();
    }

  @Get('/get-request')
  @Response(GetSupportRequestUserResponse)
  public async getSupportRequestByUser(
    @CurrentUser({ required: true }) currentUser: User
  ) {
    return await this.getPendingSupportRequestUseCase.getPendingRequest(currentUser);
  }

  @Post('/create-request')
  @Response(CreateSupportRequestsResponse)
  public async createSupportRequest(
    @CurrentUser({ required: true }) currentUser: User,
    @Body() createNewSupportRequest: CreateNewSupportRequest
  ) {
    return await this.createSupportRequestUseCase.createSupportRequest(createNewSupportRequest, currentUser);
  }
}
