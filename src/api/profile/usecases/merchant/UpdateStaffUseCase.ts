import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { MerchantProfileService } from '@api/profile/services/MerchantProfileService';
import { Operation } from '@api/profile/models/Operation';
import { SharedBlacklistService } from '@api/blacklist/services/SharedBlacklistService';
import { OperationWalletError } from '@api/profile/errors/OperationWallet';
import { OperationError } from '@api/errors/OperationError';
import { UserProfileService } from '@api/profile/services/UserProfileService';
import { WalletAddressManagementService } from '@api/profile/services/WalletAddressManagementService';
import { AdminProfileService } from '@api/profile/services/AdminProfileService';
import { UpdateStaffBodyRequest } from '@api/profile/requests/Merchants/UpdateStaffBodyRequest';
import { UpdateStaffTransactionUseCase } from '@api/profile/usecases/merchant/UpdateStaffTransactionUseCase';

@Service()
export class UpdateStaffUseCase {
  constructor(
    private merchantProfileService: MerchantProfileService,
    private userProfileService: UserProfileService,
    private sharedBlacklistService: SharedBlacklistService,
    private walletAddressManagementService: WalletAddressManagementService,
    private adminProfileService: AdminProfileService,
    private updateStaffTransactionUseCase: UpdateStaffTransactionUseCase,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async updateStaff(
    currentUser: Operation,
    staffId: string,
    body: UpdateStaffBodyRequest
  ) {
    this.log.debug(
      `Start implement updateStaffFromMerchantManager for ${currentUser.type} ${currentUser.walletAddress} and staff ${staffId}`
    );

    const staff = await this.merchantProfileService.findOneById(staffId);

    if (!staff || staff.merchantManagerId !== currentUser.id) {
      return OperationError.MERCHANT_NOT_FOUND;
    }

    if (staff.activatedAt && Object.keys(body).length) {
      return OperationError.CAN_NOT_UPDATE_OPERATION;
    }
    if (body.walletAddress && staff.walletAddress !== body.walletAddress) {
      if (await this.sharedBlacklistService.isBlacklisted(body.walletAddress)) {
        return OperationWalletError.THE_WALLET_ADDRESS_IS_IN_THE_BLACKLIST;
      }
      const operation = await this.merchantProfileService.findOneByWallet(body.walletAddress);
      if (operation) {
        return OperationError.STAFF_WALLET_ADDRESS_ALREADY_CREATED;
      }
      const user = await this.userProfileService.findOneByWallet(body.walletAddress);
      if (user) {
        return OperationError.STAFF_WALLET_ADDRESS_ALREADY_CREATED;
      }
      const walletManagement = await this.walletAddressManagementService.findWalletAddress(body.walletAddress);
      if (walletManagement) {
        return OperationError.STAFF_WALLET_ADDRESS_ALREADY_CREATED;
      }
    }
    if (body.nickName && staff.nickName !== body.nickName) {
      const adminProfile = await this.adminProfileService.findOneByNickName(body.nickName);
      if (adminProfile) {
        return OperationError.NICKNAME_IS_EXISTED;
      }
      if (body.nickName?.toLowerCase() === currentUser.nickName.toLowerCase()) {
        return OperationError.NICKNAME_IS_EXISTED;
      }
      const otherStaff = await this.merchantProfileService.getStaffByNickName(currentUser.id, body.nickName);
      if (otherStaff) {
        return OperationError.NICKNAME_IS_EXISTED;
      }
    }

    await this.updateStaffTransactionUseCase.updateStaffTransactional(staff, body);

    this.log.debug(
      `Stop implement updateStaffFromMerchantManager for ${currentUser.type} ${currentUser.walletAddress} and staff ${staffId}`
    );
    return null;
  }
}
