import { GetPostByMerchantRequest } from '@api/post/requests/GetPostByMerchantRequest';
import { MarketplacePostService } from '@api/post/services/MarketplacePostService';
import { SharedProfileService } from '@api/profile/services/SharedProfileService';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';

@Service()
export class GetPostByMerchantUseCase {
  constructor(
    private merchantManagerService: SharedProfileService,
    private postService: MarketplacePostService,
    @Logger(__filename) private log: LoggerInterface
  ) {}
  public async getPosts(getPostByMerchantRequest: GetPostByMerchantRequest) {
    const { type, page, limit, merchantId } = getPostByMerchantRequest;

    this.log.debug(
      `Start implementing searchOnlinePostByMerchant with params: ${JSON.stringify(getPostByMerchantRequest)}`
    );
    this.log.debug('[searchOnlinePostByMerchant] get all operator');
    const operators = await this.merchantManagerService.findAllOperatorByMerchantManagerRefId(merchantId);

    if (!operators.length) {
      this.log.debug(
        `Stop implementing searchOnlinePostByMerchant with params: ${JSON.stringify(getPostByMerchantRequest)}`
      );
      return { items: [], totalItems: 0 };
    }

    this.log.debug('[searchOnlinePostByMerchant] get online post');
    const [posts, totalPosts] = await this.postService.searchOnlinePost({
      type,
      page,
      limit,
      merchantIds: operators.map((o) => o.id),
    });
    this.log.debug(
      `Stop implementing searchOnlinePostByMerchant with params: ${JSON.stringify(getPostByMerchantRequest)}`
    );
    return { items: posts, totalItems: totalPosts };
  }
}
