import { IsEnum, IsNotEmpty, IsOptional, IsPositive } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

import { TradeType } from '@api/common/models/P2PEnum';

import { SEARCH_POST_TYPE } from '../../../common/validations/ValidationType';

export class PostPublicViewRequest {
  @JSONSchema({ type: 'integer', example: 1 })
  public page: number;

  @IsNotEmpty({
    context: {
      key: SEARCH_POST_TYPE.LIMIT_IS_INVALID,
    },
  })
  @IsPositive({
    context: {
      key: SEARCH_POST_TYPE.LIMIT_IS_INVALID,
    },
  })
  @JSONSchema({ type: 'integer', example: 10 })
  public limit: number;

  @IsOptional()
  @IsEnum(TradeType, {
    context: {
      key: SEARCH_POST_TYPE.TYPE_IS_INVALID,
    },
  })
  @JSONSchema({ type: 'string', example: 'BUY' })
  public type: TradeType;

  @IsOptional()
  public order: 'ASC' | 'DESC';
}
