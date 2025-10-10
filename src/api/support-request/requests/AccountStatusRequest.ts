import { IsArray, IsOptional, IsString } from 'class-validator';

export class AccountStatusRequest {
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    public accountIds: string[];
}
