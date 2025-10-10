import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { ReferralRepository } from '@api/referral/repositories/ReferralRepository';
import { User } from '@api/profile/models/User';
import { UserRepository } from '@api/profile/repositories/UserRepository';
import { P2PError } from '@api/common/errors/P2PError';
import { ReferralCodeError } from '@api/referral/errors/ReferralCodeError';
import { Referral } from '@api/referral/models/Referral';
import { SubmitReferralCodeRequest } from '@api/referral/requests/SubmitReferralCodeRequest';
import { ReferralStatus } from '@api/referral/enums/Referral';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { env } from '@base/env';
import { FeatureResponseError } from '@api/common/errors/FeatureError';
import { TRANSACTION_DEFAULT_OPTIONS } from '@api/common/constants/TransactionConstant';

@Service()
export class ReferralService {
    constructor(
        @InjectRepository() private referralRepository: ReferralRepository,
        @InjectRepository() private userRepository: UserRepository,
        @Logger(__filename) private log: LoggerInterface
    ) { }

    @Transactional(TRANSACTION_DEFAULT_OPTIONS)
    public async submitReferralCode(submitReferralCodeRequest: SubmitReferralCodeRequest, currentUser: User): Promise<Referral> {
        if (!env.referral.enable) {
            throw new P2PError(FeatureResponseError.FEATURE_NOT_SUPPORTED);
        }
        if (currentUser.isReferred) {
            throw new P2PError(ReferralCodeError.ALREADY_ENTERED_REFERRAL_CODE);
        }
        if (submitReferralCodeRequest.referralCode === currentUser.referralCode) {
            throw new P2PError(ReferralCodeError.YOU_CANNOT_SUBMIT_YOUR_CODE);
        }
        const inviter = await this.userRepository.searchInviterByReferralCode(submitReferralCodeRequest.referralCode);
        if (!inviter) {
            throw new P2PError(ReferralCodeError.REFERRAL_CODE_NOT_FOUND);
        }
        const referralInvitee = await this.referralRepository.findOne({
            where: {
                inviteeId: currentUser.id,
            },
        });
        if (referralInvitee) {
            throw new P2PError(ReferralCodeError.ALREADY_ENTERED_REFERRAL_CODE);
        }
        try {
            const newReferralCode = new Referral();
            newReferralCode.inviterId = inviter.id;
            newReferralCode.inviteeId = currentUser.id;
            const [newReferral] = await Promise.all([
                this.referralRepository.save(newReferralCode),
                this.userRepository.update({
                id: currentUser.id,
                }, {
                    isReferred: true,
                }),
            ]);
            return newReferral;
        } catch (error: any) {
            this.log.error(error?.name, error?.message, error?.stack);
            throw new P2PError(ReferralCodeError.ENTER_REFERRAL_CODE_FAIL);
        }
    }

    public async handleReferralOrderCompleted(inviteeId: string, orderId: string) {
        if (!env.referral.enable) { return; }
        try {
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
        } catch (error: any) {
            this.log.error(error?.name, error?.message, error?.stack);
        }
    }
}
