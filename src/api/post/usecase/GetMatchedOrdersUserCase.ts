import { Service } from 'typedi';
import { GetMatchedOrdersRequest } from '@api/post/requests/Merchant/GetMatchedOrdersRequest';
import { SharedOrderService } from '@api/order/services/order/SharedOrderService';
import { Operation } from '@api/profile/models/Operation';
import { PostError } from '@api/post/errors/PostError';
import { MerchantPostService } from '@api/post/services/MerchantPostService';
import { Logger, LoggerInterface } from '@base/decorators/Logger';

@Service()
export class GetMatchedOrderUseCase {
  constructor(
    private orderService: SharedOrderService,
    private postService: MerchantPostService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getMatchedOrders(
    currentUser: Operation,
    getMatchedOrdersRequest?: GetMatchedOrdersRequest
  ) {
    this.log.debug(
      `Start implement getHistoriesOrderPosting method for ${currentUser.type} ${currentUser.walletAddress} and post ${getMatchedOrdersRequest.id}`
    );
    const post = await this.postService.getFullInfoPostByRefId({ refId: getMatchedOrdersRequest.id, merchantId: currentUser.id });
    if (!post) {
      return PostError.POST_NOT_FOUND;
    }
    const [orders, total] = await this.orderService.getMatchedOrdersByPost({
      ...getMatchedOrdersRequest,
      postRefId: getMatchedOrdersRequest.id,
    });
    this.log.debug(
      `Stop implement getHistoriesOrderPosting method for ${currentUser.type} ${currentUser.walletAddress} and post ${getMatchedOrdersRequest.id}`
    );
    return {
      items: orders,
      totalItems: total,
    };
  }
}
