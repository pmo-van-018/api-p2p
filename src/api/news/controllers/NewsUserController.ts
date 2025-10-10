import { ControllerBase } from '@api/infrastructure/abstracts/ControllerBase';
import { Response } from '@base/decorators/Response';
import {
  Get,
  JsonController,
} from 'routing-controllers';
import { GetNewsByUsersUseCase } from '@api/news/usecases/GetNewsByUserUseCase';
import { NewsListResponse } from '../responses/NewsListResponse';

@JsonController('/news')
export class NewsUserController extends ControllerBase {
  constructor(
    private getNewsByUsersUseCase: GetNewsByUsersUseCase
  ) {
    super();
  }

  @Get('/get-news')
  @Response(NewsListResponse)
  public async getNewsByAdmin() {
    return await this.getNewsByUsersUseCase.getNewsByUser();
  }
}
