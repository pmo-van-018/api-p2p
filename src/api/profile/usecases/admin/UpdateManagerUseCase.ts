import {Service} from 'typedi';
import {Logger, LoggerInterface} from '@base/decorators/Logger';
import {UpdateMerchantManagerBodyRequest} from '@api/profile/requests/UpdateMerchantManagerBodyRequest';
import {OperationError} from '@api/errors/OperationError';
import {MerchantProfileService} from '@api/profile/services/MerchantProfileService';
import {OperationType} from '@api/common/models';
import {OperationWalletError} from '@api/profile/errors/OperationWallet';
import {SharedBlacklistService} from '@api/blacklist/services/SharedBlacklistService';
import {CheckWalletAddressIsExistUseCase} from '@api/profile/usecases/CheckWalletAddressIsExistUseCase';
import {CheckNickNameIsExistUseCase} from '@api/profile/usecases/CheckNickNameIsExistUseCase';
import {AdminProfileService} from '@api/profile/services/AdminProfileService';
import moment from 'moment';
import {UpdateManagerTransactionalUseCase} from '@api/profile/usecases/admin/UpdateManagerTransactionalUseCase';

@Service()
export class UpdateManagerUseCase {
  constructor(
    private adminProfileService: AdminProfileService,
    private merchantProfileService: MerchantProfileService,
    private blacklistService: SharedBlacklistService,
    private checkWalletAddressIsExistUseCase: CheckWalletAddressIsExistUseCase,
    private checkNickNameIsExistUseCase: CheckNickNameIsExistUseCase,
    private updateManagerTransactionalUseCase: UpdateManagerTransactionalUseCase,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async updateManager(managerId: string, body: UpdateMerchantManagerBodyRequest) {
    this.log.debug(`Start implement updateManager: ${managerId} with params: ${JSON.stringify(body)}`);
    const merchantManager = await this.merchantProfileService.findOneById(managerId);
    if (!merchantManager || merchantManager.type !== OperationType.MERCHANT_MANAGER) {
      return OperationError.MERCHANT_NOT_FOUND;
    }

    if (merchantManager.activatedAt) {
      return OperationError.CAN_NOT_UPDATE_OPERATION;
    }

    if (body.walletAddress && merchantManager.walletAddress !== body.walletAddress) {
      if (await this.blacklistService.isBlacklisted(body.walletAddress)) {
        return OperationWalletError.THE_WALLET_ADDRESS_IS_IN_THE_BLACKLIST;
      }
      const isWalletAddressExit = await this.checkWalletAddressIsExistUseCase.isExist(body.walletAddress);
      if (isWalletAddressExit) {
        return OperationError.STAFF_WALLET_ADDRESS_ALREADY_CREATED;
      }
    }
    if (body.nickName && merchantManager.nickName !== body.nickName) {
      const isNickNameExit = await this.checkNickNameIsExistUseCase.isExist(body.nickName, OperationType.SUPER_ADMIN);
      if (isNickNameExit) {
        return OperationError.NICKNAME_IS_EXISTED;
      }
    }

    const { contractFrom, contractTo } = this.adminProfileService.getDateContract(body, merchantManager);
    const invalidDateContract = contractFrom && contractTo && contractFrom > contractTo;
    if (invalidDateContract) {
      return OperationError.DATE_CONTRACT_IS_INVALID;
    }

    await this.updateManagerTransactionalUseCase.updateMerchantManagerTransactional(merchantManager, {
      ...body,
      contractFrom,
      contractTo,
      activatedAt: this.merchantProfileService.isFirstActive(merchantManager, body.status)
        ? moment.utc().toDate()
        : merchantManager.activatedAt,
    });
    this.log.debug(`Stop implement updateManager: ${managerId} with params: ${JSON.stringify(body)}`);
    return null;
  }
}
