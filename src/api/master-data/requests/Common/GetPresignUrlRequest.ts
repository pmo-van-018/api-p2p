import { IsNotEmpty, IsString } from 'class-validator';

export class GetPresignedUrlRequest {
  @IsNotEmpty()
  @IsString()
  readonly fileName: string;
}
