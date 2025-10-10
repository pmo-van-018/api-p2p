import { Post } from '@api/post/models/Post';
import { GetMerchantBriefPostResponse } from '@api/post/responses/GetMerchantBriefPostResponse';

export class GetMerchantPostResponse extends GetMerchantBriefPostResponse {
  public paymentTimeLimit: number;
  public note: string;

  constructor(post: Post) {
    super(post);
    this.paymentTimeLimit = post.paymentTimeLimit;
    this.note = post.note;
  }
}
