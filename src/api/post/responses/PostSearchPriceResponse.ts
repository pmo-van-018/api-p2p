import { RecommendPriceCache } from '@api/post/types/Post';

export class PostSearchPriceResponse {
  public prices: RecommendPriceCache[];

  constructor(data: RecommendPriceCache[]) {
    this.prices = data;
  }
}
