import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { ReferralRepository } from '@api/referral/repositories/ReferralRepository';
import { env } from '@base/env';
import { ReferralStatus } from '@api/referral/enums/Referral';

@Service()
export class SharedReferralService {
  constructor(
    @InjectRepository() private referralRepository: ReferralRepository
  ) { }
  public countTotalReferredByInviterId(userId: string) {
    return this.referralRepository.countTotalReferredByInviterId(userId);
  }

  public async handleReferralOrderCompleted(inviteeId: string, orderId: string) {
    if (!env.referral.enable) { return; }
    const pendingReferal = await this.referralRepository.findOne({
      where: {
        inviteeId,
        status: ReferralStatus.PENDING,
      },
    });
    if (!pendingReferal) {
      return;
    }
    await this.referralRepository.update(
      {
        id: pendingReferal.id,
      },
      {
        status: ReferralStatus.REDEEMED,
        orderId,
      }
    );
  }
}
