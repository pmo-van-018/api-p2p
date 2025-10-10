import { RefIDParamRequest } from "@api/common/requests/BaseRequest";
import { IsBoolean, IsOptional, IsString } from "class-validator";

export class ConfirmSentFiatRequest extends RefIDParamRequest{
    @IsOptional()
    @IsBoolean()
    public isPaymentFromAnotherAccount: boolean;

    @IsOptional() 
    @IsString()
    public paymentMethodId: string;
}
