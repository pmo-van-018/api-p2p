import { Service } from 'typedi';
import { MarketplacePostService } from '@api/post/services/MarketplacePostService';
import redisClient from '@base/utils/redis-client';
import { toStatusKey } from '@base/utils/redis-key';

@Service()
export class GetOnlinePostUseCase {
  constructor(private marketplacePostService: MarketplacePostService) {}
  public async getOnlinePosts(postIds: string[]) {
    if (!postIds?.length) {
      return [];
    }
    const posts = await this.marketplacePostService.getOnlinePosts(postIds);
    if (!posts?.length) {
      return [];
    }
    const pipeline = redisClient.pipeline();
    posts.forEach((post) => {
      pipeline.get(toStatusKey(post.merchantId));
    });
    const results = await pipeline.exec();
    if (!Array.isArray(results)) {
      return [];
    }
    const postOnlineIds: string[] = [];
    results.forEach((item: any[], index: number) => {
      if (item[1]) {
        postOnlineIds.push(posts[index]?.refId);
      }
    });
    return postOnlineIds;
  }
}
