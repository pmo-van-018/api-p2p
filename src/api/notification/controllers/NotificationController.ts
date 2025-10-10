import { NotificationListRequest } from '@api//notification/requests/NotificationListRequest';
import { ControllerBase } from '@api/infrastructure/abstracts/ControllerBase';
import { NotificationSubscribeCreateRequest } from '@api/notification/requests/NotificationSubscribeCreateRequest';
import { UpdateNotificationBodyRequest } from '@api/notification/requests/UpdateNotificationBodyRequest';
import { NotificationResponse } from '@api/notification/responses/NotificationResponse';
import { PaginationNotificationResponse, Response } from '@base/decorators/Response';
import {
  Authorized,
  Body,
  CurrentUser,
  Delete,
  Get,
  JsonController,
  Params,
  Post,
  Put,
  QueryParams,
  Req,
} from 'routing-controllers';
import { UUIDParamRequest } from '@api/common/requests/BaseRequest';
import { Member } from '@api/profile/types/User';
import { EmptyResponse } from '@api/common/responses/EmptyResponse';
import { CreateSubscriptionUseCase } from '@api/notification/usecase/CreateSubscriptionUseCase';
import { GetNotificationUseCase } from '@api/notification/usecase/GetNotificationUseCase';
import { UpdateNotificationStatusUseCase } from '@api/notification/usecase/UpdateNotificationStatusUseCase';
import { ReadAllNotificationUseCase } from '@api/notification/usecase/ReadAllNotificationUseCase';
import { DeleteAllNotificationUseCase } from '@api/notification/usecase/DeleteAllNotificationUseCase';

@JsonController('/notification')
export class NotificationController extends ControllerBase {
  constructor(
    private createSubscriptionUseCase: CreateSubscriptionUseCase,
    private getNotificationUseCase: GetNotificationUseCase,
    private updateNotificationStatusUseCase: UpdateNotificationStatusUseCase,
    private readAllNotificationUseCase: ReadAllNotificationUseCase,
    private deleteAllNotificationUseCase: DeleteAllNotificationUseCase
  ) {
    super();
  }

  @Authorized()
  @Post('/create-subscription')
  @Response(EmptyResponse)
  public async createSubscription(
    @Body() notificationRequest: NotificationSubscribeCreateRequest,
    @Req() request: any,
    @CurrentUser({ required: true }) currentUser: Member
  ) {
    return await this.createSubscriptionUseCase.createSubscriber(
      currentUser,
      request.sessionID,
      notificationRequest.playerId
    );
  }

  @Get('/get-notifications')
  @PaginationNotificationResponse(NotificationResponse)
  public async getAllNotification(
    @CurrentUser({ required: true }) currentUser: Member,
    @QueryParams() notificationListRequest: NotificationListRequest
  ) {
    return await this.getNotificationUseCase.getNotifications(currentUser, notificationListRequest);
  }

  @Authorized()
  @Put('/update-status-notification/:id')
  @Response(EmptyResponse)
  public async updateStatusNotification(
    @Params() params: UUIDParamRequest,
    @Body() body: UpdateNotificationBodyRequest,
    @CurrentUser({ required: true }) currentUser: Member
  ) {
    return await this.updateNotificationStatusUseCase.updateStatus(currentUser, body, params.id);
  }
  @Authorized()
  @Put('/mark-read-all-notifications')
  @Response(EmptyResponse)
  public async markReadAllNotifications(@CurrentUser({ required: true }) currentUser: Member) {
    return await this.readAllNotificationUseCase.readAll(currentUser);
  }

  @Authorized()
  @Delete('/delete-all-notifications')
  @Response(EmptyResponse)
  public async deleteAllNotifications(@CurrentUser({ required: true }) currentUser: Member) {
    return await this.deleteAllNotificationUseCase.deleteAll(currentUser);
  }
}
