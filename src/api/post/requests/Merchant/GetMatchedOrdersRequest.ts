import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { PaginationQueryRequest } from '@api/common/requests/PaginationQueryRequest';
import { ValidateError } from '@api/post/errors/ValidateError';

export class GetMatchedOrdersRequest extends PaginationQueryRequest {
  @IsNotEmpty({ context: ValidateError.POST_ID_REQUIRED })
  @IsString({ context: ValidateError.POST_ID_INVALID })
  @Length(20, 20, { context: ValidateError.POST_ID_INVALID })
  @Matches(/^[0-9]*$/, { context: ValidateError.POST_ID_INVALID })
  public id: string;
}
