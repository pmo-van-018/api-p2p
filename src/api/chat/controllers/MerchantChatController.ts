import { JsonController, Get, CurrentUser, Params, Post, Body } from 'routing-controllers';
import { ControllerBase } from '@api/infrastructure/abstracts/ControllerBase';
import { Response } from '@base/decorators/Response';
import { RefIDParamRequest } from '@api/common/requests/BaseRequest';
import { Operation } from '@api/profile/models/Operation';
import { ParticipantsResponse } from '@api/chat/responses/ParticipantsResponse';
import { GetParticipantsByOperationUseCase } from '@api/chat/usecase/GetParticipantsByOperationUseCase';
import { MerchantAuthorized } from '@api/auth/services/MerchantAuthorized';
import { CreateChatRoomUseCase } from '@api/chat/usecase/CreateChatRoomUseCase';
import { MERCHANT_ROLE_TYPE } from '@api/common/models';
import { CreatedResponse } from '@api/common/responses/CreatedResponse';
import { CreateChatRoomRequest } from '@api/chat/requests/CreateChatRoomRequest';

@JsonController('/chat/merchant')
export class MerchantChatController extends ControllerBase {
  constructor(
    private getParticipantsByOperationUseCase: GetParticipantsByOperationUseCase,
    private createChatRoomUseCase: CreateChatRoomUseCase
  ) {
    super();
  }

  @Post('/create-order-room-chat')
  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_OPERATOR])
  @Response(CreatedResponse)
  public async createChatRoomByOperator(
    @Body() request: CreateChatRoomRequest,
    @CurrentUser({ required: true }) currentUser: Operation
  ) {
    return await this.createChatRoomUseCase.createChatRoom(request.orderId, currentUser.id);
  }

  @Get('/list-participants/:id')
  @MerchantAuthorized()
  @Response(ParticipantsResponse)
  public async getParticipantsByOperation(
    @Params() params: RefIDParamRequest,
    @CurrentUser({ required: true }) currentUser: Operation
  ) {
    return await this.getParticipantsByOperationUseCase.getParticipants(currentUser, params.id);
  }
}
