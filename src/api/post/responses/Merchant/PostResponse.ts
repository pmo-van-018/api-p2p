import { PostDetailBaseResponse } from '@api/post/responses/Merchant/PostDetailBaseResponse';
import { Post } from '@api/post/models/Post';
import { PostStatus } from '@api/common/models';

export class PostResponse extends PostDetailBaseResponse {
  public blockAmount: number;
  public feePercent: number;

  constructor(post: Post) {
    super(post);
    delete this.fixedPriceBeforeFee;
    delete this.userToMerchantTime;
    this.blockAmount = Number(post.blockAmount);
    if (post.status !== PostStatus.CLOSE) {
      this.feePercent = post.merchant?.masterDataLevel?.fee || 0;
    }
  }
}
