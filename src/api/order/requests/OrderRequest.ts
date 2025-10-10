import { IsNotEmpty, IsUUID } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

import { ORDER_TYPE } from '@api/common/validations/ValidationType';

export class OrderRequest {
  @IsNotEmpty({
    context: {
      key: ORDER_TYPE.ORDER_ID_IS_INVALID,
    },
  })
  @IsUUID(4, {
    context: {
      key: ORDER_TYPE.ORDER_ID_IS_INVALID,
    },
  })
  @JSONSchema({ type: 'string', example: '1' })
  public orderId: string;
}
