import {Service} from 'typedi';
import {Logger, LoggerInterface} from '@base/decorators/Logger';
import {MerchantProfileService} from '@api/profile/services/MerchantProfileService';
import {OperationError} from '@api/errors/OperationError';
import {Operation} from '@api/profile/models/Operation';

@Service()
export class GetStaffInfoUseCase {
  constructor(
    private merchantProfileService: MerchantProfileService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getInfo(currentUser: Operation, staffId: string) {
    this.log.debug(
      `Start implement getMerchantInfo for ${currentUser.type} ${currentUser.walletAddress} and staff ${staffId}`
    );
    const staff = await this.merchantProfileService.findStaffByManager(staffId, currentUser.id);

    if (!staff) {
      return OperationError.MERCHANT_NOT_FOUND;
    }
    this.log.debug(
      `Stop implement getMerchantInfo for ${currentUser.type} ${currentUser.walletAddress} and staff ${staffId}`
    );
    return staff;
  }
}
