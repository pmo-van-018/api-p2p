import { PostStatus, TradeType } from '@api/common/models/P2PEnum';
import { Post } from '@api/post/models/Post';
import { Helper } from '@api/infrastructure/helpers/Helper';

export class PostDetailBaseResponse {
  public postId: string;
  public postRefId: string;
  public postType: TradeType;
  public fiatName: string;
  public fiatSymbol: string;
  public cryptoName: string;
  public cryptoNetwork: string;
  public userToMerchantTime: number;
  public fixedPriceBeforeFee: number;
  public availableAmount: number;
  public totalAmount: number;
  public finishedAmount: number;
  public price: number;
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
    this.postId = post.id;
    this.postRefId = post.refId;
    this.postType = post.type;
    this.fiatName = post.fiat?.name;
    this.fiatSymbol = post.fiat?.symbol;
    this.cryptoName = post.asset?.symbol;
    this.cryptoNetwork = post.asset?.network;
    this.userToMerchantTime = post.paymentTimeLimit;
    this.fixedPriceBeforeFee = Number(post.price);
    this.price = Number(post.realPrice);
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
    if (post.status === PostStatus.CLOSE) {
      this.totalFee = post.totalFee;
      this.totalPenaltyFee = post.totalPenaltyFee;
    }
  }
}
