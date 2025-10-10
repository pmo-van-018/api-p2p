import { IsNotEmpty, IsString, Matches, MaxLength } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { ReferralCodeError } from "@api/referral/errors/ReferralCodeError";

export class SubmitReferralCodeRequest {
    @IsNotEmpty()
    @IsString()
    @MaxLength(8, {
        context: {
            key: ReferralCodeError.REFERRAL_CODE_MAX_LENGTH,
          },
    })
    @Matches(/^[A-Za-z0-9]*$/, {
        context: {
            key: ReferralCodeError.REFERRAL_CODE_INVALID,
          },
    })
    @JSONSchema({ type: 'string', example: 'c1ef122A' })
    public referralCode: string;
}
