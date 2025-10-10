import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { setCache, deleteCache, wrap } from '@base/utils/redis-client';
import { AdjustmentRating, CalculateMerchantRating } from '@api/order/types/Order';
import { CACHE_REDIS_LATEST_MERCHANT_RATING_KEY, VolumeService } from '@api/statistic/services/VolumeService';
import { VolumeRepository } from '@api/statistic/repositories/VolumeRepository';
import { Operation } from '@api/profile/models/Operation';
import moment from 'moment';
import { orderSumData } from '../types/Volume';
import { User } from '@api/profile/models/User';
import { SharePublicViewAdjustmentService } from './SharePublicViewAdjustmentService';

export const CACHE_REDIS_ADJUSTMENT_CACHE_KEY = '__cache_adjustment__';

@Service()
export class SharedVolumeService {
  constructor(
    private volumeService: VolumeService,
    private sharePublicViewAdjustmentService: SharePublicViewAdjustmentService,
    @InjectRepository() private volumeRepository: VolumeRepository,
  ) {}
  public async calculateMerchantRating() {
    return await wrap(CACHE_REDIS_LATEST_MERCHANT_RATING_KEY, async () => {
      const volumes = await this.volumeRepository.getMerchantVolume();
      if (volumes && volumes.length > 0) {
        const merchantRatings: CalculateMerchantRating[] = volumes.map((vl) => {
          return {
            operationId: vl.operationId,
            totalOrder: Number(vl.numberTransactionBuy) + Number(vl.numberTransactionSell),
            totalSuccessOrder: Number(vl.numberTransactionSuccess),
            merchantManagerId: vl.merchantManagerId,
          };
        });
        return merchantRatings;
      }
      return null;
    });
  }

  public async adjustmentMerchantRating() {
    return await wrap(CACHE_REDIS_ADJUSTMENT_CACHE_KEY, async () => {
      const adjustmentRatings = await this.sharePublicViewAdjustmentService.getPublicViewAdjustments();
      if (adjustmentRatings?.length) {
        const merchantRatings: AdjustmentRating[] = adjustmentRatings.map((ar) => {
          return {
            managerId: ar.managerId,
            totalOrderCompleted: ar.totalOrderCompleted,
            totalRateCompleted: ar.totalRateCompleted,
          };
        });
        return merchantRatings;
      }
      return null;
    });
  }

  public clearAdjustmentCache() {
    return deleteCache(CACHE_REDIS_ADJUSTMENT_CACHE_KEY);
  }

  public async refreshStatistic(currentUser: Operation | User) {
    const orderData = await this.volumeService.getStatisticByDate(currentUser,
      moment().utc().startOf('date').toDate(),
      moment().toDate()
    );
    if (orderData) {
      await this.setStatisticCache(orderData, currentUser.id);
    }
  }

  private async setStatisticCache(orderData: orderSumData, currentUserId: string) {
    await setCache(this.volumeService.getStatisticCacheKey(currentUserId), orderData);
  }
}
