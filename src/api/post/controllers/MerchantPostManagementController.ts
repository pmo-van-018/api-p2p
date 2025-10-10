import { MERCHANT_ROLE_TYPE } from '@api/common/models/P2PEnum';
import { Operation } from '@api/profile/models/Operation';
import { ControllerBase } from '@api/infrastructure/abstracts/ControllerBase';
import {
  MerchantCreatePostRequest,
  MerchantGetListPostRequest,
  MerchantUpdatePostRequest,
  MerchantUpdateStatusPostRequest,
} from '@api/post/requests/Merchant';
import { MerchantPostDetailResponse, MerchantPostHistoryDetailResponse } from '@api/post/responses/Merchant';
import { PaginationResponse, Response } from '@base/decorators/Response';
import { PostSearchPriceResponse } from '@api/post/responses/PostSearchPriceResponse';
import { Body, CurrentUser, Get, JsonController, Params, Post, Put, QueryParams } from 'routing-controllers';
import { RefIDParamRequest } from '@api/common/requests/BaseRequest';
import { MerchantAuthorized } from '@api/auth/services/MerchantAuthorized';
import { CreatedResponse } from '@api/common/responses/CreatedResponse';
import { CreatePostUseCase } from '@api/post/usecase/CreatePostUseCase';
import { PostItemListResponse } from '@api/post/responses/Merchant/PostItemListResponse';
import { GetListPostUseCase } from '@api/post/usecase/GetListPostUseCase';
import { GetPostInfoByMerchantUseCase } from '@api/post/usecase/GetPostInfoByMerchantUseCase';
import { EmptyResponse } from '@api/common/responses/EmptyResponse';
import { UpdatePostByMerchantUseCase } from '@api/post/usecase/UpdatePostByMerchantUseCase';
import { ClosePostByMerchantUseCase } from '@api/post/usecase/ClosePostByMerchantUseCase';
import { GetMatchedOrdersRequest } from '@api/post/requests/Merchant/GetMatchedOrdersRequest';
import { MatchedOrdersResponse } from '@api/post/responses/Merchant/MatchedOrdersResponse';
import { GetMatchedOrderUseCase } from '@api/post/usecase/GetMatchedOrdersUserCase';
import { UpdateStatusPostByMerchantUseCase } from '@api/post/usecase/UpdateStatusPostByMerchantUseCase';
import { GetPostRecommendPriceUseCase } from '@api/post/usecase/GetPostRecommendPriceUseCase';
import { GetReferenceExchangeRateRequest } from '../requests/GetReferenceExchangeRateRequest';
import { GetReferenceExchangeRateResponse } from '../responses/GetReferenceExchangeRateResponse';
import { GetReferenceExchangeRateUseCase } from '@api/post/usecase/GetReferenceExchangeRateUseCase';

@JsonController('/posts/merchant')
export class MerchantPostManagementController extends ControllerBase {
  constructor(
    private createPostUseCase: CreatePostUseCase,
    private updatePostByMerchantUseCase: UpdatePostByMerchantUseCase,
    private getListPostUseCase: GetListPostUseCase,
    private getPostInfoByMerchantUseCase: GetPostInfoByMerchantUseCase,
    private closePostByMerchantUseCase: ClosePostByMerchantUseCase,
    private getMatchedOrdersUseCase: GetMatchedOrderUseCase,
    private updatePostStatusByMerchantUseCase: UpdateStatusPostByMerchantUseCase,
    private getPostRecommendPriceUseCase: GetPostRecommendPriceUseCase,
    private getReferenceExchangeRateUseCase: GetReferenceExchangeRateUseCase
  ) {
    super();
  }

  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_OPERATOR])
  @Post('/create-post')
  @Response(CreatedResponse)
  public async createPost(
    @Body() postRequest: MerchantCreatePostRequest,
    @CurrentUser({ required: true }) currentUser: Operation
  ) {
    return await this.createPostUseCase.createPost(currentUser, postRequest);
  }

  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_OPERATOR, MERCHANT_ROLE_TYPE.MERCHANT_MANAGER])
  @Put('/update-post')
  @Response(EmptyResponse)
  public async updatePost(
    @Body() postRequest: MerchantUpdatePostRequest,
    @CurrentUser({ required: true }) currentUser: Operation
  ) {
    return await this.updatePostByMerchantUseCase.updatePost(currentUser, postRequest);
  }

  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_OPERATOR])
  @Get('/get-post-info/:id')
  @Response(MerchantPostDetailResponse)
  public async getPostDetail(
    @Params() params: RefIDParamRequest,
    @CurrentUser({ required: true }) currentUser: Operation
  ) {
    return await this.getPostInfoByMerchantUseCase.getPostDetail(currentUser, params.id);
  }

  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_OPERATOR])
  @Get('/list-posts')
  @PaginationResponse(PostItemListResponse)
  public async getListPosts(
    @QueryParams() merchantGetListPostRequest: MerchantGetListPostRequest,
    @CurrentUser({ required: true }) currentUser: Operation
  ) {
    return await this.getListPostUseCase.getListPosts(currentUser, merchantGetListPostRequest);
  }

  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_OPERATOR])
  @Put('/close-post/:id')
  @Response(EmptyResponse)
  public async closePost(@Params() params: RefIDParamRequest, @CurrentUser({ required: true }) currentUser: Operation) {
    return await this.closePostByMerchantUseCase.closePost(currentUser, params.id);
  }

  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_OPERATOR, MERCHANT_ROLE_TYPE.MERCHANT_MANAGER])
  @Put('/update-post-status/:id')
  @Response(EmptyResponse)
  public async updateStatusPost(
    @Params() params: RefIDParamRequest,
    @Body() merchantUpdateStatusPostRequest: MerchantUpdateStatusPostRequest,
    @CurrentUser({ required: true }) currentUser: Operation
  ) {
    return await this.updatePostStatusByMerchantUseCase.updateStatusPost(currentUser, merchantUpdateStatusPostRequest.showAd, params.id);
  }

  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_OPERATOR])
  @Get('/get-post-history/:id')
  @Response(MerchantPostHistoryDetailResponse)
  public async get(
    @Params() params: RefIDParamRequest,
    @CurrentUser({ required: true }) currentUser: Operation
  ) {
    return await this.getPostInfoByMerchantUseCase.getPostDetail(currentUser, params.id);
  }

  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_OPERATOR])
  @Get('/get-matched-orders-by-post')
  @PaginationResponse(MatchedOrdersResponse)
  public async getMatchedOrders(
    @QueryParams() getMatchedOrdersRequest: GetMatchedOrdersRequest,
    @CurrentUser({ required: true }) currentUser: Operation
  ) {
    return await this.getMatchedOrdersUseCase.getMatchedOrders(currentUser, getMatchedOrdersRequest);
  }

  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_OPERATOR, MERCHANT_ROLE_TYPE.MERCHANT_MANAGER])
  @Get('/get-post-recommend-price')
  @Response(PostSearchPriceResponse)
  public async getRecommendPrice() {
    return await this.getPostRecommendPriceUseCase.getPrice();
  }

  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_OPERATOR])
  @Get('/search-reference-exchange-rate')
  @Response(GetReferenceExchangeRateResponse)
  public async searchReferenceExchangeRate(@QueryParams() getReferenceExchangeRateRequest: GetReferenceExchangeRateRequest) {
    return await this.getReferenceExchangeRateUseCase.getExchangeRate(getReferenceExchangeRateRequest);
  }
}
