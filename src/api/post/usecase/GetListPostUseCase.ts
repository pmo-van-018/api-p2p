import { Service } from 'typedi';
import { Post } from '@api/post/models/Post';
import { Operation } from '@api/profile/models/Operation';
import { PaginationResult } from '@api/common/types';
import { MerchantGetListPostRequest } from '@api/post/requests/Merchant';
import { MerchantPostService } from '@api/post/services/MerchantPostService';
import { Helper } from '@api/infrastructure/helpers/Helper';
import { Logger, LoggerInterface } from '@base/decorators/Logger';

@Service()
export class GetListPostUseCase {
  constructor(
    private postService: MerchantPostService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getListPosts(
    currentUser: Operation,
    merchantGetListPostRequest: MerchantGetListPostRequest
  ): Promise<PaginationResult<Post>> {
    const { limit, page, orderField, orderDirection, status, assetId, type } =
      merchantGetListPostRequest;
    this.log.debug(
      `Start implement listPosting method for ${currentUser.type} ${
        currentUser.walletAddress
      } with params ${JSON.stringify(merchantGetListPostRequest)}`
    );
    const [ items, totalItems ] = await this.postService.getListByMerchant({
      limit,
      page,
      type,
      merchantId: currentUser.id,
      status: Helper.normalizeStringToArray(status, ','),
      assetId,
      orderField,
      orderDirection,
    });
    this.log.debug(
      `Stop implement listPosting method for ${currentUser.type} ${
        currentUser.walletAddress
      } with params ${JSON.stringify(merchantGetListPostRequest)}`
    );
    return { items, totalItems };
  }
}
