import { IsArray, IsOptional, IsString, Length, Matches } from 'class-validator';
import { ValidateError } from '@api/post/errors/ValidateError';

export class PostOnlineStatusRequest {
    @IsOptional()
    @IsArray({ context: ValidateError.POST_ID_INVALID })
    @IsString({ each: true, context: ValidateError.POST_ID_INVALID })
    @Length(20, 20, { each: true, context: ValidateError.POST_ID_INVALID })
    @Matches(/^[0-9]*$/, { each: true, context: ValidateError.POST_ID_INVALID })
    public postIds: string[];
}
