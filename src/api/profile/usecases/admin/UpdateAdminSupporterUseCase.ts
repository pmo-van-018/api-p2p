import {Service} from 'typedi';
import {Logger, LoggerInterface} from '@base/decorators/Logger';
import {UpdateAdminSupporterBodyRequest} from '@api/profile/requests/UpdateAdminSupporterBodyRequest';
import {OperationError} from '@api/errors/OperationError';
import moment from 'moment';
import {AdminProfileService} from '@api/profile/services/AdminProfileService';
import {OperationType} from '@api/common/models';
import {OperationWalletError} from '@api/profile/errors/OperationWallet';
import {SharedBlacklistService} from '@api/blacklist/services/SharedBlacklistService';
import {CheckWalletAddressIsExistUseCase} from '@api/profile/usecases/CheckWalletAddressIsExistUseCase';
import {CheckNickNameIsExistUseCase} from '@api/profile/usecases/CheckNickNameIsExistUseCase';

@Service()
export class UpdateAdminSupporterUseCase {
  constructor(
    private adminProfileService: AdminProfileService,
    private blacklistService: SharedBlacklistService,
    private checkWalletAddressIsExistUseCase: CheckWalletAddressIsExistUseCase,
    private checkNickNameIsExistUseCase: CheckNickNameIsExistUseCase,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async updateAdminSupporter(
    adminSupporterId: string,
    body: UpdateAdminSupporterBodyRequest
  ) {
    this.log.debug(`Start implement updateAdminSupporterFromAdmin for ${adminSupporterId}`);
    const adminSupporter = await this.adminProfileService.findOneById(adminSupporterId, OperationType.ADMIN_SUPPORTER);
    if (!adminSupporter) {
      return OperationError.ADMIN_SUPPORTER_NOT_FOUND;
    }

    if (adminSupporter.activatedAt) {
      return OperationError.CAN_NOT_UPDATE_OPERATION;
    }
    if (adminSupporter.walletAddress !== body.walletAddress) {
      if (await this.blacklistService.isBlacklisted(body.walletAddress)) {
        return OperationWalletError.THE_WALLET_ADDRESS_IS_IN_THE_BLACKLIST;
      }

      const isWalletAddressExit = await this.checkWalletAddressIsExistUseCase.isExist(body.walletAddress);
      if (isWalletAddressExit) {
        return OperationError.STAFF_WALLET_ADDRESS_ALREADY_CREATED;
      }
    }
    if (adminSupporter.nickName !== body.nickName) {
      const isNickNameExit = await this.checkNickNameIsExistUseCase.isExist(body.nickName, OperationType.SUPER_ADMIN);
      if (isNickNameExit) {
        return OperationError.NICKNAME_IS_EXISTED;
      }
    }

    const payload = {
      ...body,
      activatedAt:
        body.status && this.adminProfileService.isFirstActive(adminSupporter, body.status)
          ? moment.utc().toDate()
          : adminSupporter.activatedAt,
    };

    await this.adminProfileService.updateAdmin(adminSupporter.id, payload);

    this.log.debug(`Stop implement updateAdminSupporterFromAdmin for ${adminSupporterId}`);
    return null;
  }
}
