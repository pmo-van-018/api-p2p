import { Post } from '@api/post/models/Post';
import { PostStatus, TradeType } from '@api/common/models';
import BigNumber from 'bignumber.js';
import { Operation } from '@api/profile/models/Operation';

export class PostDetailResponse {
  public id: string;
  public type: TradeType;
  public fiatId: string;
  public assetId: string;
  public userToMerchantTime: number;
  public realPrice: number;
  public totalAmount: number;
  public availableAmount: number;
  public price: number;
  public lowerFiatLimit: number;
  public upperFiatLimit: number;
  public status: string;
  public createdAt: Date;
  public updatedAt: Date;
  public fee: number;
  public note: string;
  public paymentMethodId: string;
  constructor(post: Post) {
    this.id = post.refId;
    this.type = post.type;
    this.fiatId = post.fiatId;
    this.assetId = post.assetId;
    this.userToMerchantTime = post.paymentTimeLimit;
    this.price = Number(post.price);
    this.realPrice = Number(post.realPrice);
    this.totalAmount = Number(post.totalAmount);
    this.availableAmount = Number(post.availableAmount);
    this.lowerFiatLimit = Number(post.minOrderAmount);
    this.upperFiatLimit = Number(post.maxOrderAmount);
    this.updatedAt = post.updatedAt;
    this.createdAt = post.createdAt;
    this.status = PostStatus[post.status];
    this.note = post.note;
    if (post.type === TradeType.SELL && post.paymentMethodId) {
      this.paymentMethodId = post.paymentMethodId;
    }
  }
}

// TODO: remove when refactor profile module
export class MerchantInfoResponse {
  public nickName: string;

  public monthFinishRate = 0;

  public monthOrderCount: number;
  public fee: number;
  constructor(merchant: Operation) {
    this.nickName = merchant?.nickName;
    this.monthOrderCount = merchant?.statistic?.monthOrderCount ?? 0;
    this.fee = merchant?.masterDataLevel?.fee ?? 0;
    if (this.monthOrderCount) {
      this.monthFinishRate = new BigNumber(merchant.statistic.monthOrderCompletedCount)
        .dividedBy(this.monthOrderCount)
        .toNumber();
    }
  }
}
