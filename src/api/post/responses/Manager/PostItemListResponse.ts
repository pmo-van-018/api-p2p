import { PostStatus, TradeType } from '@api/common/models/P2PEnum';
import { Post } from '@api/post/models/Post';
import { Helper } from '@api/infrastructure/helpers/Helper';

export class PostItemListResponse {
  public id: string;
  public type: TradeType;
  public fiatName: string;
  public fiatSymbol: string;
  public cryptoName: string;
  public cryptoNetwork: string;
  public realPrice: number;
  public totalAmount: number;
  public availableAmount: number;
  public finishedAmount: number;
  public price: number;
  public lowerFiatLimit: number;
  public upperFiatLimit: number;
  public status: string;
  public createdAt: Date;
  public updatedAt: Date;
  public fee: number;
  public percentCryptoCompleted: number;
  public merchantNickName: string;
  public merchantWalletAddress: string;

  constructor(post: Post) {
    this.id = post.refId;
    this.type = post.type;
    this.fiatName = post.fiat?.name;
    this.fiatSymbol = post.fiat?.symbol;
    this.cryptoName = post.asset?.symbol;
    this.cryptoNetwork = post.asset?.network;
    this.price = Number(post.price);
    this.realPrice = Number(post.realPrice);
    this.totalAmount = Number(post.totalAmount);
    this.availableAmount = Number(post.availableAmount);
    this.finishedAmount = Number(post.finishedAmount);
    this.lowerFiatLimit = Number(post.minOrderAmount);
    this.upperFiatLimit = Number(post.maxOrderAmount);
    this.updatedAt = post.updatedAt;
    this.createdAt = post.createdAt;
    this.status = PostStatus[post.status];
    this.percentCryptoCompleted = Helper.computePercentCalculation(
      Number(post.finishedAmount),
      Number(post.totalAmount)
    );
    this.fee = post.merchant?.masterDataLevel?.fee;
    this.merchantNickName = post.merchant?.nickName;
    this.merchantWalletAddress = post.merchant?.walletAddress;
  }
}
