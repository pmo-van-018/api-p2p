import { ControllerBase } from '@api/infrastructure/abstracts/ControllerBase';
import { User } from '@api/profile/models/User';
import { ShowInfoUserResponse } from '@api/profile/responses/UserInfoResponse';
import { UserProfileResponse } from '@api/profile/responses/UserProfileResponse';
import { Response } from '@base/decorators/Response';
import { Body, CurrentUser, Get, JsonController, Put } from 'routing-controllers';
import { UserUpdateAvatarRequest } from '@api/profile/requests/Users/UserUpdateAvatarRequest';
import { UserUpdateAllowNotificationRequest } from '@api/profile/requests/Users/UserUpdateAllowNotificationRequest';
import { GetProfileByUserUseCase } from '@api/profile/usecases/user/GetProfileByUserUseCase';
import { GetUserInfoUseCase } from '@api/profile/usecases/user/GetUserInfoUseCase';
import { UserAuthorized } from '@api/auth/services/UserAuthorized';
import { EmptyResponse } from '@api/common/responses/EmptyResponse';
import { UpdateAllowNotificationUseCase } from '@api/profile/usecases/user/UpdateAllowNotificationUseCase';
import { UpdateAvatarByUserUseCase } from '@api/profile/usecases/user/UpdateAvatarByUserUseCase';
import { SkipSystemNoteUseCase } from '@api/profile/usecases/user/SkipSystemNoteUseCase';

@JsonController('/profile')
@UserAuthorized()
export class UserProfileController extends ControllerBase {
  constructor(
    private getProfileByUserUseCase: GetProfileByUserUseCase,
    private getUserInfoUseCase: GetUserInfoUseCase,
    private updateAllowNotificationUseCase: UpdateAllowNotificationUseCase,
    private updateAvatarByUserUseCase: UpdateAvatarByUserUseCase,
    private skipSystemNoteUseCase: SkipSystemNoteUseCase
  ) {
    super();
  }

  @Get('/')
  @Response(UserProfileResponse)
  public async getCurrentUserProfile(@CurrentUser({ required: true }) currentUser: User) {
    return await this.getProfileByUserUseCase.getProfile(currentUser.id);
  }

  @Get('/get-info')
  @Response(ShowInfoUserResponse)
  public async getInfo(@CurrentUser({ required: true }) currentUser: User) {
    return await this.getUserInfoUseCase.getInfo(currentUser.id);
  }

  @Put('/update-allow-notification')
  @Response(EmptyResponse)
  public async updateInfo(
    @CurrentUser({ required: true }) currentUser: User,
    @Body() body: UserUpdateAllowNotificationRequest
  ) {
    return await this.updateAllowNotificationUseCase.updateAllowNotification(currentUser.id, body.allowNotification);
  }

  @Put('/update-avatar')
  @Response(EmptyResponse)
  public async updateAvatar(
    @CurrentUser({ required: true }) currentUser: User,
    @Body() userUpdateAvatarRequest: UserUpdateAvatarRequest
  ) {
    return await this.updateAvatarByUserUseCase.updateAvatar(currentUser.id, userUpdateAvatarRequest.avatar);
  }

  @Put('/skip-system-note')
  @Response(EmptyResponse)
  public async skipSystemNote(@CurrentUser({ required: true }) currentUser: User) {
    return await this.skipSystemNoteUseCase.skipNote(currentUser.id);
  }
}
