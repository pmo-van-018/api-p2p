import { Service } from 'typedi';
import { MerchantPostService } from '@api/post/services/MerchantPostService';
import { PostError } from '@api/post/errors/PostError';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Operation } from '@api/profile/models/Operation';

@Service()
export class GetPostInfoByMerchantUseCase {
  constructor(
    private postService: MerchantPostService,
    @Logger(__filename) private log: LoggerInterface
  ) {
  }
  public async getPostDetail(currentUser: Operation, refId: string) {
    this.log.debug(
      `Start implement showPosting method for ${currentUser.type} ${currentUser.walletAddress} and post ${refId}`
    );
    const post = await this.postService.getFullInfoPostByRefId({ refId, merchantId: currentUser.id });
    if (!post) {
      return PostError.POST_NOT_FOUND;
    }
    this.log.debug(
      `Stop implement showPosting method for ${currentUser.type} ${currentUser.walletAddress} and post ${refId}`
    );
    return post;
  }
}
