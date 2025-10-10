import { PostStatus } from '@api/common/models/P2PEnum';
import { Post } from '@api/post/models/Post';

export class PostCreateResponse {
  public postRefId: string;
  public status: string;

  constructor(post: Post) {
    this.postRefId = post.refId;
    this.status = PostStatus[post.status];
  }
}
