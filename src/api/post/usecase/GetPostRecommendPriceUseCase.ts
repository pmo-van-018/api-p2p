import { Service } from 'typedi';
import {
  GetSortedSetType,
  TradeType,
} from '@api/common/models/P2PEnum';
import {
  getCache,
  getRecommendPriceCacheKey,
  getSortedCache,
} from '@base/utils/redis-client';
import { RecommendPriceCache } from '../types/Post';
import { differenceWith, isEqual } from 'lodash';
import { SharedResourceService } from '@api/master-data/services/SharedResourceService';
import { MerchantPostService } from '@api/post/services/MerchantPostService';
import { Logger, LoggerInterface } from '@base/decorators/Logger';

@Service()
export class GetPostRecommendPriceUseCase {
  constructor(
    private resourceService: SharedResourceService,
    private postService: MerchantPostService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getPrice(): Promise<RecommendPriceCache[]> {
    this.log.debug(`Start implement getPrice method`);
    const assets = await this.resourceService.getEnableAssets();
    if (!assets || !assets.length) {
      return [];
    }
    const getPriceAssets: RecommendPriceCache[] = await getCache(this.postService.getKeyPriceAssets());
    const getPriceEnableAssets: RecommendPriceCache[] = (getPriceAssets || []).filter(c => assets.find(e => e.id === c.assetId));
    const assetChecker: RecommendPriceCache[] = [];
    assets.forEach((e) => {
      assetChecker.push({
        assetId: e.id,
        postType: TradeType.BUY,
      });
      assetChecker.push({
        assetId: e.id,
        postType: TradeType.SELL,
      });
    });
    const differenceAssets = differenceWith(assetChecker, getPriceEnableAssets, isEqual);
    if (differenceAssets?.length) {
      const recommends: RecommendPriceCache[] = await this.postService.getListRecommendPrices();
      differenceAssets.map(async (asset) => {
        const recommendPrice = recommends.find((rm) => rm.assetId === asset.assetId && rm.postType === asset.postType);
        if (!recommendPrice) {
          return;
        }
        await this.postService.setRecommendPrice({
          assetId: recommendPrice.assetId,
          postType: recommendPrice.postType,
          postId: recommendPrice.postId,
          price: recommendPrice.price,
        });
      });
    }
    const prices: RecommendPriceCache[] = [];
    for (const asset of assets) {
      const minPriceKey = getRecommendPriceCacheKey({ assetId: asset.id, postType: TradeType.SELL });
      const maxPriceKey = getRecommendPriceCacheKey({ assetId: asset.id, postType: TradeType.BUY });
      const [minPrice, maxPrice] = await Promise.all([
        getSortedCache(minPriceKey, GetSortedSetType.minimum),
        getSortedCache(maxPriceKey, GetSortedSetType.maximum),
      ]);
      const assetBuyByKey = this.postService.convertKeyPriceToAsset(minPriceKey);
      const assetBuy: RecommendPriceCache = {
        assetId: assetBuyByKey.assetId,
        postType: assetBuyByKey.postType,
        price: minPrice,
      };
      const assetSellByKey = this.postService.convertKeyPriceToAsset(maxPriceKey);
      const assetSell: RecommendPriceCache = {
        assetId: assetSellByKey.assetId,
        postType: assetSellByKey.postType,
        price: maxPrice,
      };
      prices.push(assetBuy, assetSell);
    }
    this.log.debug(`Stop implement getPrice method`);
    return prices;
  }
}
