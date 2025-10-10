import { JsonController, CurrentUser, Body, Post } from 'routing-controllers';
import { ControllerBase } from '@api/infrastructure/abstracts/ControllerBase';
import { Response } from '@base/decorators/Response';
import { User } from '@api/profile/models/User';
import { OpenAppealBuyOrderUseCase } from '@api/appeal/usecase/OpenAppealBuyOrderUseCase';
import { OpenAppealSellOrderUseCase} from '@api/appeal/usecase/OpenAppealSellOrderUseCase';
import { OpenAppealRequest } from '@api/appeal/requests/OpenAppealRequest';
import { UserAuthorized } from '@api/auth/services/UserAuthorized';
import { OpenAppealResponse } from '../responses/OpenAppealResponse';

@JsonController('/appeals')
@UserAuthorized()
export class UserAppealController extends ControllerBase {
  constructor(
    private openAppealBuyOrderUseCase: OpenAppealBuyOrderUseCase,
    private openAppealSellOrderUseCase: OpenAppealSellOrderUseCase
  ) {
    super();
  }

  @Post('/open-appeal-buy-order')
  @Response(OpenAppealResponse)
  public async openAppealBuyOrder(
    @Body() body: OpenAppealRequest,
    @CurrentUser({ required: true }) currentUser: User
  ) {
     return await this.openAppealBuyOrderUseCase.openAppealBuyOrder(currentUser, body.orderId);
  }

  @Post('/open-appeal-sell-order')
  @Response(OpenAppealResponse)
  public async openAppealSellCrypto(
    @Body() body: OpenAppealRequest,
    @CurrentUser({ required: true }) currentUser: User
  ) {
    return await this.openAppealSellOrderUseCase.openAppealSellOrder(currentUser, body.orderId);
  }
}
