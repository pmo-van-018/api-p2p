import { Service } from 'typedi';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { Post } from '@api/post/models/Post';
import { PostError } from '@api/post/errors/PostError';
import { PostStatus } from '@api/common/models/P2PEnum';
import { Operation } from '@api/profile/models/Operation';
import {
  delSortedCache,
  getRecommendPriceCacheKey,
} from '@base/utils/redis-client';
import { MerchantPostService } from '@api/post/services/MerchantPostService';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { SharedStatisticService } from '@api/statistic/services/SharedStatisticService';
import { TRANSACTION_DEFAULT_OPTIONS } from '@api/common/constants/TransactionConstant';

@Service()
export class ClosePostByMerchantUseCase {
  constructor(
    private postService: MerchantPostService,
    private statisticService: SharedStatisticService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  public async closePost(currentUser: Operation, refId: string) {
    this.log.debug(
      `Start implement closePosting method for ${currentUser.type} ${currentUser.walletAddress} and post ${refId}`
    );
    const post = await this.postService.getMerchantPostWithLock({
      refId,
      merchantId: currentUser.id,
    });
    if (!post) {
      return PostError.POST_ID_IS_INVALID;
    }
    if (post.status === PostStatus.CLOSE) {
      return PostError.CANNOT_UPDATE_CLOSED_POST;
    }

    await this.closePostingTransactional(currentUser, post);
    this.log.debug(
      `Stop implement closePosting method for ${currentUser.type} ${currentUser.walletAddress} and post ${refId}`
    );
    return null;
  }

  private async closePostingTransactional(currentUser: Operation, post: Post): Promise<void> {
    this.log.debug(
      `Start implement closePostingTransactional method for ${currentUser.type} ${currentUser.walletAddress} and post ${post.id}`
    );
    // Update post status wih optimistic lock
    await this.postService.closePost(post.id, currentUser.id);
    if (post.status === PostStatus.ONLINE) {
      await this.statisticService.decrementShownPost(currentUser.id);
    }
    const sortedCacheKey = getRecommendPriceCacheKey({ assetId: post.assetId, postType: post.type });
    await delSortedCache(sortedCacheKey, post.id);
    await this.postService.refreshCachePost();
  }
}
