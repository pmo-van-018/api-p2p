import { Referral } from "@api/referral/models/Referral";

export class SubmitReferralCodeResponse {
    public referralId: string;
  
    constructor(data: Referral) {
      this.referralId = data.id;
    }
}
