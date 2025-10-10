import { Post } from '@api/post/models/Post';

export class GetMerchantBriefPostResponse {
  public id: string;
  public fiatName: string;
  public fiatSymbol: string;
  public assetName: string;
  public assetNetwork: string;
  public price: number;
  public minOrderAmount: number;
  public maxOrderAmount: number;
  public availableAmount: number;

  constructor(post: Post) {
    this.id = post.refId;
    this.fiatName = post.fiat?.name;
    this.fiatSymbol = post.fiat?.symbol;
    this.assetName = post.asset?.name;
    this.assetNetwork = post.asset?.network;
    this.price = Number(post.realPrice);
    this.minOrderAmount = Number(post.minOrderAmount);
    this.maxOrderAmount = Number(post.maxOrderAmount);
    this.availableAmount = Number(post.availableAmount);
  }
}
