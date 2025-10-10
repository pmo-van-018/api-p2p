import { IsEnum, IsNotEmpty } from 'class-validator';
import { CREATE_POST_TYPE } from '@api/common/validations/ValidationType';
import { PostStatus } from '@api/common/models/P2PEnum';
import { JSONSchema } from 'class-validator-jsonschema';

export class UpdateStatusPostRequest {
  @IsNotEmpty({
    context: {
      key: CREATE_POST_TYPE.POST_ID_IS_INVALID,
    },
  })
  @IsEnum(PostStatus, {
    each: true,
    context: {
      key: CREATE_POST_TYPE.POST_ID_IS_INVALID,
    },
  })
  @JSONSchema({ type: 'string', example: 1 })
  public showAd: number;
}
