import {
  CurrentUser,
  Get,
  JsonController,
  Params,
} from 'routing-controllers';
import { ControllerBase } from '@api/infrastructure/abstracts/ControllerBase';
import { Response } from '@base/decorators/Response';
import { Operation } from '@api/profile/models/Operation';
import { RefIDParamRequest } from '@api/common/requests/BaseRequest';
import { AdminAuthorized } from '@api/auth/services/AdminAuthorized';
import { ParticipantsResponse } from '@api/chat/responses/ParticipantsResponse';
import { GetParticipantsByOperationUseCase } from '@api/chat/usecase/GetParticipantsByOperationUseCase';
import { ADMIN_ROLE_TYPE } from '@api/common/models';

@JsonController('/chat/admin')
export class AdminChatController extends ControllerBase {
  constructor(
    private getParticipantsByOperationUseCase: GetParticipantsByOperationUseCase
  ) {
    super();
  }

  @AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN, ADMIN_ROLE_TYPE.ADMIN_SUPPORTER])
  @Get('/list-participants/:id')
  @Response(ParticipantsResponse)
  public async getParticipantsByOperation(
    @CurrentUser({ required: true }) currentUser: Operation,
    @Params() params: RefIDParamRequest
  ) {
    return await this.getParticipantsByOperationUseCase.getParticipants(currentUser, params.id);
  }
}
