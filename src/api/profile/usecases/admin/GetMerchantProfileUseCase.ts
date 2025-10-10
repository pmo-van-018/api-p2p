import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { OperationError } from '@api/errors/OperationError';
import { MerchantProfileService } from '@api/profile/services/MerchantProfileService';
import { WalletAddressManagementService } from '@api/profile/services/WalletAddressManagementService';
import {OperationStatus} from "@api/common/models";
import { SharePublicViewAdjustmentService } from '@api/statistic/services/SharePublicViewAdjustmentService';
@Service()
export class GetMerchantProfileUseCase {
  constructor(
    private merchantProfileService: MerchantProfileService,
    private walletAddressManagementService: WalletAddressManagementService,
    private sharePublicViewAdjustmentService: SharePublicViewAdjustmentService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getProfile(managerId: string) {
    this.log.debug(`Start implement getManagerProfile: ${managerId}`);
    const merchantManager = await this.merchantProfileService.findOneById(managerId);
    if (!merchantManager) {
      return OperationError.MERCHANT_NOT_FOUND;
    }
    const staffCount = await this.merchantProfileService.countStaff(managerId, [OperationStatus.ACTIVE, OperationStatus.INACTIVE]);
    const walletAddressManagements = await this.walletAddressManagementService.getWalletAddressListByManagerId(
      merchantManager.id
    );
    const publicViewAdjustments = await this.sharePublicViewAdjustmentService.getPublicViewAdjustmentByManagerId(managerId);
    this.log.debug(`Stop implement getManagerProfile: ${managerId}`);
    return { merchantManager, walletAddressManagements, staffCount, publicViewAdjustments };
  }
}
