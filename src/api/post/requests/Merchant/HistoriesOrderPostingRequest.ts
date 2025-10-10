import { IsNotEmpty, IsOptional, IsPositive, IsUUID } from 'class-validator';
import { CREATE_POST_TYPE, LIST_PARAM_TYPE } from '@api/common/validations/ValidationType';
import { JSONSchema } from 'class-validator-jsonschema';
import { IsSortProperty } from '@api/common/validations/IsSortProperty';

export class HistoriesOrderPostingRequest {
  @IsNotEmpty({
    context: {
      key: LIST_PARAM_TYPE.PAGE_IS_INVALID,
    },
  })
  @IsPositive({
    context: {
      key: LIST_PARAM_TYPE.PAGE_IS_INVALID,
    },
  })
  @JSONSchema({ type: 'integer', example: 1 })
  public page: number;

  @IsNotEmpty({
    context: {
      key: LIST_PARAM_TYPE.LIMIT_IS_INVALID,
    },
  })
  @IsPositive({
    context: {
      key: LIST_PARAM_TYPE.LIMIT_IS_INVALID,
    },
  })
  @JSONSchema({ type: 'integer', example: 10 })
  public limit: number;

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
  @JSONSchema({ type: 'string', example: '1' })
  public postId: string;

  @IsOptional()
  @IsSortProperty(['amount', 'updatedAt', 'id', 'endedTime', 'status', 'step'])
  @JSONSchema({ type: 'string', example: 'updatedAt:ASC' })
  public sort: string = 'updatedAt:ASC';
}
