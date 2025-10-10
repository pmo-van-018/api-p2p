import { Post } from '@api/post/models/Post';
import { PostStatus, TradeType } from '@api/common/models';
import { Helper } from '@api/infrastructure/helpers/Helper';

export class PostHistoryDetailResponse {
  public id: string;
  public type: TradeType;
  public fiatName: string;
  public fiatSymbol: string;
  public cryptoName: string;
  public cryptoNetwork: string;
  public availableAmount: number;
  public totalAmount: number;
  public finishedAmount: number;
  public lowerFiatLimit: number;
  public upperFiatLimit: number;
  public status: string;
  public createdAt: Date;
  public updatedAt: Date;
  public fee: number;
  public percentCryptoCompleted: number;
  public totalFee: number;
  public totalPenaltyFee: number;
  constructor(post: Post) {
    this.id = post.refId;
    this.type = post.type;
    this.fiatName = post.fiat?.name;
    this.fiatSymbol = post.fiat?.symbol;
    this.cryptoName = post.asset?.symbol;
    this.cryptoNetwork = post.asset?.network;
    this.availableAmount = Number(post.availableAmount);
    this.totalAmount = Number(post.totalAmount);
    this.lowerFiatLimit = Number(post.minOrderAmount);
    this.upperFiatLimit = Number(post.maxOrderAmount);
    this.updatedAt = post.updatedAt;
    this.createdAt = post.createdAt;
    this.status = PostStatus[post.status];
    this.finishedAmount = Number(post.finishedAmount);
    this.percentCryptoCompleted = Helper.computePercentCalculation(
      Number(post.finishedAmount),
      Number(post.totalAmount)
    );
    this.totalFee = post.totalFee;
    this.totalPenaltyFee = post.totalPenaltyFee;
  }
}
