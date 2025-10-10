import { Service } from 'typedi';
import { GetPostRequest } from '@api/post/requests/GetPostRequest';
import { SharedResourceService } from '@api/master-data/services/SharedResourceService';
import { SharedVolumeService } from '@api/statistic/services/SharedVolumeService';
import { MerchantRating } from '@api/post/types/Post';
import _groupBy from 'lodash/groupBy';
import { MarketplacePostService } from '@api/post/services/MarketplacePostService';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { AdjustmentRating } from '@api/order/types/Order';
import BigNumber from 'bignumber.js';

@Service()
export class GetPostUseCase {
  constructor(
    private sharedResourceService: SharedResourceService,
    private volumeService: SharedVolumeService,
    private postService: MarketplacePostService,
    @Logger(__filename) private log: LoggerInterface
  ) {
  }
  public async getPosts(searchPostRequest: GetPostRequest) {
    const {
      type,
      fiat,
      assetName,
      assetNetwork,
      page,
      limit,
      amount,
      minAmount,
      maxAmount,
      sortDirection
    } = searchPostRequest;

    this.log.debug(`Start implementing searchOnlinePost with params: ${JSON.stringify(searchPostRequest)}`);

    const fiatId = (await this.sharedResourceService.getFiatByName(fiat))?.id;
    const assetId = (await this.sharedResourceService.getAssetByNameAndNetwork(assetName, assetNetwork))?.id;

    const [posts, totalPosts] = await this.postService.searchOnlinePost({
      type,
      fiatId,
      assetId,
      page,
      limit,
      amount,
      minAmount,
      maxAmount,
      sortDirection,
    });
    this.log.debug('[searchOnlinePost] calculate merchant rating');
    const merchantRatings: MerchantRating[] = await this.volumeService.calculateMerchantRating();
    const adjustmentRatings: AdjustmentRating[] = await this.volumeService.adjustmentMerchantRating();

    const groupRatingByManager = _groupBy(merchantRatings, 'merchantManagerId');

    const managerToStatistic = Object.entries(groupRatingByManager ?? {}).reduce(
      (map, [merchantManagerId, ratings]: any) => {
        const monthOrderCount = ratings.reduce((total: number, rating: MerchantRating) => total + rating?.totalOrder ?? 0, 0);
        const monthOrderCompletedCount = ratings.reduce((total: number, rating: MerchantRating) => total + rating?.totalSuccessOrder ?? 0, 0);
        return {
          ...map,
          [merchantManagerId]: {
            monthOrderCount: map[merchantManagerId]?.monthOrderCount ?? 0 + monthOrderCount,
            monthOrderCompletedCount: map[merchantManagerId]?.monthOrderCompletedCount ?? 0 + monthOrderCompletedCount,
          },
        };
      },
      {}
    );

    this.log.debug('[searchOnlinePost] calculate merchant manager rating');
    for (const post of posts) {
      const adjustmentRating = adjustmentRatings?.find((mr) => mr?.managerId === post.merchant.merchantManagerId);
      post.merchant.merchantManager.statistic.monthOrderCount = adjustmentRating?.totalOrderCompleted || managerToStatistic?.[post.merchant?.merchantManagerId]?.monthOrderCount || 0;
      post.merchant.merchantManager.statistic.monthOrderCompletedCount =
        new BigNumber(adjustmentRating?.totalOrderCompleted).multipliedBy(adjustmentRating?.totalRateCompleted).toNumber() || managerToStatistic?.[post.merchant?.merchantManagerId]?.monthOrderCompletedCount || 0;
    }
    this.log.debug(`Stop implement searchOnlinePost with params: ${JSON.stringify(searchPostRequest)}`);
    return { items: posts, totalItems: totalPosts };
  }
}
