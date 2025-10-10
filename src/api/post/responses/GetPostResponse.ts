import { Post } from '@api/post/models/Post';
import { GetBriefPostResponse } from '@api/post/responses/GetBriefPostResponse';

export class GetPostResponse extends GetBriefPostResponse {
  public paymentTimeLimit: number;
  public note: string;

  constructor(post: Post) {
    super(post);
    this.paymentTimeLimit = post.paymentTimeLimit;
    this.note = post.note;
  }
}
