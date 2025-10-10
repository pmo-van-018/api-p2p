import { PostStatus } from '@api/common/models';
import { Post } from '@api/post/models/Post';
import { PostDetailBaseResponse } from '@api/post/responses/Merchant';

export class ManagerPostResponse extends PostDetailBaseResponse {
  public blockAmount: number;
  public feePercent: number;
  public nickname: string;
  public walletAddress: string;

  constructor(post: Post) {
    super(post);
    delete this.fixedPriceBeforeFee;
    delete this.userToMerchantTime;
    this.blockAmount = Number(post.blockAmount);
    if (post.status !== PostStatus.CLOSE) {
      this.feePercent = post.merchant?.masterDataLevel?.fee || 0;
    }
    this.nickname = post.merchant?.nickName;
    this.walletAddress = post.merchant?.walletAddress;
  }
}
