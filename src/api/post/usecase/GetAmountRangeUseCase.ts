import { Service } from 'typedi';
import { GetAmountRangeRequest } from '@api/post/requests/GetAmountRangeRequest';
import { MarketplacePostService } from '@api/post/services/MarketplacePostService';

@Service()
export class GetAmountRangeUseCase {
  constructor(
    private postService: MarketplacePostService
  ) {
  }
  public async getAmountRange(getAmountRangeRequest: GetAmountRangeRequest) {
    return await this.postService.getAmountRange(getAmountRangeRequest);
  }
}
