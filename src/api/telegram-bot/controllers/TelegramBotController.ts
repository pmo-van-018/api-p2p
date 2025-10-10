import { ControllerBase } from '@api/infrastructure/abstracts/ControllerBase';
import { RecommendPriceByUserResponse } from '@api/post/responses/RecommendPriceByUserResponse';
import { Response } from '@base/decorators/Response';
import { Body, Get, JsonController } from 'routing-controllers';
import { TelegramBotSecureRequest } from '../requests/TelegramBotSecureRequest';
import { GetListTopicResponse } from '../responses/GetListTopicResponse';
import { TelegramAppealDetailResponse } from '../responses/TelegramAppealDetailResponse';
import { GetAppealDetailUseCase } from '../usecase/GetAppealDetailUseCase';
import { GetTopicsUseCase } from '../usecase/GetTopicsUseCase';
import { RecommendPriceUseCase } from '../usecase/RecommendPriceUseCase';

@JsonController('/telegram-bot')
export class TelegramBotController extends ControllerBase {
  constructor(
    private getTopicsUseCase: GetTopicsUseCase,
    private getAppealDetailUseCase: GetAppealDetailUseCase,
    private recommendPriceUseCase: RecommendPriceUseCase
  ) {
    super();
  }

  @Get('/get-appeal-result')
  @Response(TelegramAppealDetailResponse)
  public async getAppealDetail(@Body() req: TelegramBotSecureRequest) {
    return await this.getAppealDetailUseCase.getAppealDetail(req.appealSecretKey);
  }

  @Get('/get-list-topic')
  @Response(GetListTopicResponse)
  public async getTopics() {
    return this.getTopicsUseCase.getTopics();
  }

  @Get('/get-recommended-price')
  @Response(RecommendPriceByUserResponse)
  public async searchPrice() {
    return await this.recommendPriceUseCase.getRecommendPriceByUser();
  }
}
