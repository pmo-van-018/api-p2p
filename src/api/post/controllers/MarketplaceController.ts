import { ControllerBase } from '@api/infrastructure/abstracts/ControllerBase';
import { GetAmountRangeRequest } from '@api/post/requests/GetAmountRangeRequest';
import { GetPostRequest } from '@api/post/requests/GetPostRequest';
import { GetAmountRange } from '@api/post/responses/GetAmountRange';
import { GetPostResponse } from '@api/post/responses/GetPostResponse';
import { PaginationResponse, Response } from '@base/decorators/Response';
import {Body, Get, JsonController, Post, QueryParams} from 'routing-controllers';
import { GetPostUseCase } from '@api/post/usecase/GetPostUseCase';
import { GetPostByMerchantRequest } from '@api/post/requests/GetPostByMerchantRequest';
import { GetPostByMerchantUseCase } from '@api/post/usecase/GetPostByMerchantUseCase';
import { GetBriefPostResponse } from '@api/post/responses/GetBriefPostResponse';
import { UserAuthorized } from '@api/auth/services/UserAuthorized';
import { GetMerchantBriefPostResponse } from '@api/post/responses/GetMerchantBriefPostResponse';
import { GetMerchantPostResponse } from '@api/post/responses/GetMerchantPostResponse';
import { GetAmountRangeUseCase } from '@api/post/usecase/GetAmountRangeUseCase';
import { GetOnlinePostUseCase } from '@api/post/usecase/GetOnlinePostUseCase';
import { PostOnlineStatusRequest } from '@api/post/requests/PostOnlineStatusRequest';
import { PostOnlineResponse } from '@api/post/responses/GetOnlinePostResponse';

@JsonController('/marketplace')
export class MarketplaceController extends ControllerBase {
  constructor(
    private getPostUseCase: GetPostUseCase,
    private getPostByMerchantUseCase: GetPostByMerchantUseCase,
    private getAmountRangeUseCase: GetAmountRangeUseCase,
    private getOnlinePostUseCase: GetOnlinePostUseCase
  ) {
    super();
  }

  @Get('/get-posts')
  @UserAuthorized()
  @PaginationResponse(GetPostResponse)
  public async getPosts(@QueryParams() getPostRequest: GetPostRequest) {
    return await this.getPostUseCase.getPosts(getPostRequest);
  }

  @Get('/get-posts-brief')
  @PaginationResponse(GetBriefPostResponse)
  public async getBriefPosts(@QueryParams() searchPostRequest: GetPostRequest) {
    return await this.getPostUseCase.getPosts(searchPostRequest);
  }

  @Get('/get-posts-by-merchant')
  @UserAuthorized()
  @PaginationResponse(GetMerchantPostResponse)
  public async getPostsByMerchant(@QueryParams() getPostByMerchantRequest: GetPostByMerchantRequest) {
    return await this.getPostByMerchantUseCase.getPosts(getPostByMerchantRequest);
  }

  @Get('/get-posts-brief-by-merchant')
  @PaginationResponse(GetMerchantBriefPostResponse)
  public async getBriefPostsByMerchant(@QueryParams() getPostByMerchantRequest: GetPostByMerchantRequest) {
    return await this.getPostByMerchantUseCase.getPosts(getPostByMerchantRequest);
  }

  @Get('/get-amount-range')
  @Response(GetAmountRange)
  public async getAmountRange(@QueryParams() query: GetAmountRangeRequest) {
    return await this.getAmountRangeUseCase.getAmountRange(query);
  }

  @Post('/list-online-posts')
  @Response(PostOnlineResponse)
  public async getPostOnline(@Body() postOnlineStatusRequest: PostOnlineStatusRequest) {
    return await this.getOnlinePostUseCase.getOnlinePosts(postOnlineStatusRequest.postIds);
  }
}
