import { Service } from 'typedi';
import { Post } from '@api/post/models/Post';
import { Operation } from '@api/profile/models/Operation';
import { PaginationResult } from '@api/common/types';
import { MerchantPostService } from '@api/post/services/MerchantPostService';
import { Helper } from '@api/infrastructure/helpers/Helper';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { ManagerPostSearchRequest } from '@api/post/requests/Manager/ManagerPostSearchRequest';

@Service()
export class GetListPostByManagerUseCase {
  constructor(
    private postService: MerchantPostService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getListPosts(
    currentUser: Operation,
    searchReq: ManagerPostSearchRequest
  ): Promise<PaginationResult<Post>> {
    this.log.debug(
      `Start implement getListPostingByOperatorsOfManager method for ${currentUser.type} ${
        currentUser.walletAddress
      } with params ${JSON.stringify(searchReq)}`
    );
    const { limit, page, orderField, orderDirection, searchType, search, status, assetId, type } = searchReq;
    const [ items, totalItems ] = await this.postService.getListByMerchantManager({
      limit,
      page,
      type,
      managerId: currentUser.id,
      status: Helper.normalizeStringToArray(status, ','),
      assetId,
      orderField,
      orderDirection,
      searchType,
      search,
    });
    this.log.debug(
      `Stop implement getListPostingByOperatorsOfManager method for ${currentUser.type} ${
        currentUser.walletAddress
      } with params ${JSON.stringify(searchReq)}`
    );
    return { items, totalItems };
  }
}
