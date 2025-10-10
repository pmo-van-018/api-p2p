import { EntityRepository } from 'typeorm';

import { RepositoryBase } from '@api/infrastructure/abstracts/RepositoryBase';
import { Referral } from '@api/referral/models/Referral';
import { ReferralStatus } from '../enums/Referral';

@EntityRepository(Referral)
export class ReferralRepository extends RepositoryBase<Referral> {
    async countTotalReferredByInviterId(inviterId: string) {
        return this.count({
            where: {
                inviterId,
                status: ReferralStatus.REDEEMED
            }
        })
    }
}
