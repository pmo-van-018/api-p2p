import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { PostRepository } from '@api/post/repositories/PostRepository';
import { SearchPost } from '@api/post/types/Post';
import { StatisticService } from '@api/statistic/services/StatisticService';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { env } from '@base/env';
import { wrap } from '@base/utils/redis-client';
import { GetAmountRangeRequest } from '@api/post/requests/GetAmountRangeRequest';
import { In } from 'typeorm';

@Service()
export class MarketplacePostService {
  constructor(
    @InjectRepository() public postRepository: PostRepository,
    @EventDispatcher() public eventDispatcher: EventDispatcherInterface,
    public statisticService: StatisticService
  ) {}

  public async searchOnlinePost(searchPostType: SearchPost) {
    return await wrap(
      this.getSearchOnlinePostRedisKey(searchPostType),
      () =>
        this.postRepository.searchOnlinePost(searchPostType),
      env.cache.searchPostTtl
    );
  }

  public getAmountRange(getAmountRangeRequest: GetAmountRangeRequest) {
    return this.postRepository.getAmountRange(getAmountRangeRequest);
  }

  public getOnlinePosts(postIds: string[]) {
    return this.postRepository.find({
      where: {
        refId: In(postIds),
      },
      select: ['id', 'merchantId', 'refId'],
    });
  }

  protected getSearchOnlinePostRedisKey(searchPostType: SearchPost): string {
    return `__cache_post_${JSON.stringify(searchPostType, Object.keys(searchPostType).sort())}`;
  }
}
