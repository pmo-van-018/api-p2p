import { ReferralService } from "@api/referral/services/ReferralService";
import { ControllerBase } from "@api/infrastructure/abstracts/ControllerBase";
import { Authorized, Body, CurrentUser, JsonController, Post } from "routing-controllers";
import { Response } from '@base/decorators/Response';
import { User } from "@api/profile/models/User";
import { SubmitReferralCodeRequest } from "@api/referral/requests/SubmitReferralCodeRequest";
import { SubmitReferralCodeResponse } from "@api/referral/responoses/SubmitReferralCodeResponse";
import { ROLE_TYPE } from "@api/common/models";

@JsonController('/referral')
@Authorized([ROLE_TYPE.USER])
export class ReferralController extends ControllerBase {
    constructor(private referralService: ReferralService) {
        super();
    }

    @Post('/submit-code')
    @Response(SubmitReferralCodeResponse)
    public async submitReferralCode(
      @CurrentUser({ required: true }) currentUser: User,
      @Body() submitReferralCodeRequest: SubmitReferralCodeRequest) {
      return this.referralService.submitReferralCode(submitReferralCodeRequest, currentUser);
    }
}
