import BigNumber from 'bignumber.js';
import { Post } from '@api/post/models/Post';
import { Operation } from '@api/profile/models/Operation';

export class GetBriefPostResponse {
  public id: string;
  public fiatName: string;
  public fiatSymbol: string;
  public assetId: string;
  public assetName: string;
  public assetNetwork: string;
  public status: string;
  public price: number;
  public minOrderAmount: number;
  public maxOrderAmount: number;
  public availableAmount: number;
  public paymentTimeLimit: number;
  public merchant: ManagerInfoResponse;

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
    this.merchant = new ManagerInfoResponse(post.merchant?.merchantManager);
  }
}

export class ManagerInfoResponse {
  public nickName: string;

  public monthFinishRate = 0;

  public monthOrderCount: number;

  public id: string;

  public avatar?: string;

  constructor(manager: Operation) {
    this.nickName = manager?.nickName;
    this.monthOrderCount = manager?.statistic?.monthOrderCount ?? 0;
    if (this.monthOrderCount > 0) {
      this.monthFinishRate = new BigNumber(manager?.statistic.monthOrderCompletedCount)
        .dividedBy(this.monthOrderCount)
        .toNumber();
    }
    this.id = manager?.refId;
    this.avatar = manager.avatar;
  }
}
