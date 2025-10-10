import { SharedPostService } from '@api/post/services/SharedPostService'
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';

@Service()
export class RecommendPriceUseCase {
    constructor(
    private sharedPostService: SharedPostService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

    public async getRecommendPriceByUser() {
        this.log.debug('Start implement getRecommendPriceByUser method');
        const recommendPrice = await this.sharedPostService.getRecommendPriceByUser();
        this.log.debug('Stop implement getRecommendPriceByUser method');
        return recommendPrice;
    }
}
