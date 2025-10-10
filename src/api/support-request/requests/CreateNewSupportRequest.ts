import { IsEnum, IsNotEmpty } from 'class-validator';
import { SupportRequestType } from '@api/support-request/models/SupportRequestEnum';
import { ValidateError } from '@api/support-request/errors/ValidateError';

  export class CreateNewSupportRequest {
    @IsNotEmpty({ context: ValidateError.SUPPORT_TYPE_IS_INVALID })
    @IsEnum(SupportRequestType, { context: ValidateError.SUPPORT_TYPE_IS_INVALID })
    public type: SupportRequestType;
}
