import { IsBoolean } from 'class-validator';
import { EmptyResponse } from './EmptyResponse';

export class SuccessResponse extends EmptyResponse {
  @IsBoolean()
  public success = true;
}
