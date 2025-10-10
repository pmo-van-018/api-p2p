import { MERCHANT_ROLE_TYPE } from '@api/common/models';
import { ControllerBase } from '@api/infrastructure/abstracts/ControllerBase';
import { ManagerPostSearchRequest } from '@api/post/requests/Manager/ManagerPostSearchRequest';
import { Operation } from '@api/profile/models/Operation';
import { PaginationResponse, Response } from '@base/decorators/Response';
import {
  CurrentUser,
  JsonController,
  Get,
  QueryParams, Params, Put, Body,
} from 'routing-controllers';
import { PostItemListResponse } from '@api/post/responses/Manager/PostItemListResponse';
import { MerchantAuthorized } from '@api/auth/services/MerchantAuthorized';
import { GetListPostByManagerUseCase } from '@api/post/usecase/GetListPostByManagerUseCase';
import { MerchantPostDetailResponse } from '@api/post/responses/Merchant';
import { RefIDParamRequest } from '@api/common/requests/BaseRequest';
import { GetPostInfoByManagerUseCase } from '@api/post/usecase/GetPostInfoByManagerUseCase';
import { EmptyResponse } from '@api/common/responses/EmptyResponse';
import { MerchantUpdatePostRequest, MerchantUpdateStatusPostRequest } from '@api/post/requests/Merchant';
import { UpdatePostByManagerUseCase } from '@api/post/usecase/UpdatePostByManagerUseCase';
import { UpdateStatusPostByManagerUseCase } from '@api/post/usecase/UpdateStatusPostByManagerUseCase';

@MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_MANAGER])
@JsonController('/posts/merchant-manager')
export class ManagerPostManagementController extends ControllerBase {
  constructor(
    private getListPostByManagerUseCase: GetListPostByManagerUseCase,
    private getPostInfoByManagerUseCase: GetPostInfoByManagerUseCase,
    private updatePostByMerchantUseCase: UpdatePostByManagerUseCase,
    private updateStatusPostByManagerUseCase: UpdateStatusPostByManagerUseCase
  ) {
    super();
  }

  @Get('/list-posts')
  @PaginationResponse(PostItemListResponse)
  public async listPosts(
    @QueryParams() searchRequest: ManagerPostSearchRequest,
    @CurrentUser({ required: true }) currentUser: Operation
  ) {
    return await this.getListPostByManagerUseCase.getListPosts(currentUser, searchRequest);
  }

  @Get('/get-post-info/:id')
  @Response(MerchantPostDetailResponse)
  public async getPostDetail(
    @Params() params: RefIDParamRequest,
    @CurrentUser({ required: true }) currentUser: Operation
  ) {
    return await this.getPostInfoByManagerUseCase.getPostDetail(currentUser, params.id);
  }

  @Put('/update-post')
  @Response(EmptyResponse)
  public async updatePost(
    @Body() postRequest: MerchantUpdatePostRequest,
    @CurrentUser({ required: true }) currentUser: Operation
  ) {
    return await this.updatePostByMerchantUseCase.updatePost(currentUser, postRequest);
  }

  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_OPERATOR, MERCHANT_ROLE_TYPE.MERCHANT_MANAGER])
  @Put('/update-post-status/:id')
  @Response(EmptyResponse)
  public async updateStatusPost(
    @Params() params: RefIDParamRequest,
    @Body() merchantUpdateStatusPostRequest: MerchantUpdateStatusPostRequest,
    @CurrentUser({ required: true }) currentUser: Operation
  ) {
    return await this.updateStatusPostByManagerUseCase.updateStatusPost(currentUser, merchantUpdateStatusPostRequest.showAd, params.id);
  }
}
