import { ControllerBase } from '@api/infrastructure/abstracts/ControllerBase';
import { Response } from '@base/decorators/Response';
import {
  Body,
  CurrentUser,
  Delete,
  Get,
  JsonController,
  Params,
  Post,
} from 'routing-controllers';
import { UUIDParamRequest } from '@api/common/requests/BaseRequest';
import { EmptyResponse } from '@api/common/responses/EmptyResponse';
import { CreateNewsUseCase } from '@api/news/usecases/CreateNewsUseCase';
import { DeleteNewsUseCase } from '@api/news/usecases/DeleteNewsUseCase';
import { GetNewsByAdminUseCase } from '@api/news/usecases/GetNewsByAdminUseCase';
import { Operation } from '@api/profile/models/Operation';
import { CreateNewsRequest } from '../requests/CreateNewsRequest';
import { NewsListResponse } from '../responses/NewsListResponse';
import { ADMIN_ROLE_TYPE } from '@api/common/models/P2PEnum';
import { AdminAuthorized } from '@api/auth/services/AdminAuthorized';

@JsonController('/news/admin')
@AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN, ADMIN_ROLE_TYPE.SYSTEM_ADMIN])
export class NewsAdminController extends ControllerBase {
  constructor(
    private createNewsUseCase: CreateNewsUseCase,
    private deleteNewsUseCase: DeleteNewsUseCase,
    private getNewsByAdminUseCase: GetNewsByAdminUseCase
  ) {
    super();
  }

  @Post('/create-news')
  @Response(EmptyResponse)
  public async createNews(
    @Body() notificationRequest: CreateNewsRequest,
    @CurrentUser() currentUser: Operation
  ) {
    return await this.createNewsUseCase.createNews(currentUser, notificationRequest);
  }

  @Get('/get-news')
  @Response(NewsListResponse)
  public async getNewsByAdmin() {
    return await this.getNewsByAdminUseCase.getNewsByAdmin();
  }

  @Delete('/delete-news/:id')
  @Response(EmptyResponse)
  public async deleteNews(@Params() request: UUIDParamRequest) {
    return await this.deleteNewsUseCase.deleteNews(request);
  }
}
