import { PaginationResult } from '@api/common/types';
import { Post } from '@api/post/models/Post';
import { ManagerPostResponse } from '@api/post/responses/Manager/ManagerPostResponse';
import { PostResponseType } from '@api/post/types/Post';

export class ManagerPostSearchResponse {
  public posts: PostResponseType[];
  public total: number;

  constructor(data: PaginationResult<Post>) {
    this.posts = data.items.map((post) => new ManagerPostResponse(post));
    this.total = data.totalItems;
  }
}
