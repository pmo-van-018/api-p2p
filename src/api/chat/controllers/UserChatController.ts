import { JsonController, CurrentUser, Get, Params } from 'routing-controllers';
import { ControllerBase } from '@api/infrastructure/abstracts/ControllerBase';
import { Response } from '@base/decorators/Response';
import { User } from '@api/profile/models/User';
import { UserAuthorized } from '@api/auth/services/UserAuthorized';
import { ParticipantsResponse } from '@api/chat/responses/ParticipantsResponse';
import { RefIDParamRequest } from '@api/common/requests/BaseRequest';
import { GetParticipantsByUserUseCase } from '@api/chat/usecase/GetParticipantsByUserUseCase';

@JsonController('/chat')
@UserAuthorized()
export class UserChatController extends ControllerBase {
  constructor(
    private getParticipantsByUserUseCase: GetParticipantsByUserUseCase
  ) {
    super();
  }

  @Get('/list-participants/:id')
  @Response(ParticipantsResponse)
  public async getParticipantsByUser(
    @Params() params: RefIDParamRequest,
    @CurrentUser({ required: true }) currentUser: User
  ) {
    return await this.getParticipantsByUserUseCase.getParticipants(currentUser.id, params.id);
  }
}
