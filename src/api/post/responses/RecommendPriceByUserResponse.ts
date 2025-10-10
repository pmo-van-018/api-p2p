import { RecommendPriceByUser } from '../types/Post';

export class RecommendPriceByUserResponse {
  public prices: RecommendPriceByUser[];

  constructor(data: RecommendPriceByUser[]) {
    this.prices = data;
  }
}
