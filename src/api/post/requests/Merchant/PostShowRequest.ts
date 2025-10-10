import { IsNotEmpty, IsUUID } from 'class-validator';
import { CREATE_POST_TYPE } from '@api/common/validations/ValidationType';

export class PostShowRequest {
  @IsNotEmpty({
    context: {
      key: CREATE_POST_TYPE.POST_ID_IS_INVALID,
    },
  })
  @IsUUID(4, {
    context: {
      key: CREATE_POST_TYPE.POST_ID_IS_INVALID,
    },
  })
  public postId: string;
}
