import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import {AdminProfileService} from '@api/profile/services/AdminProfileService';
import {
  DeleteWalletAddressUseCase as DeleteManagerWalletAddressUseCase
} from '@api/profile/usecases/merchant/DeleteWalletAddressUseCase';
import {OperationType} from '@api/common/models';
import {OperationError} from '@api/errors/OperationError';
import {DeleteWalletAddressByAdminRequest} from '@api/profile/requests/DeleteWalletAddressByAdminRequest';

@Service()
export class DeleteWalletAddressUseCase {
  constructor(
    private adminProfileService: AdminProfileService,
    private deleteManagerWalletAddressUseCase: DeleteManagerWalletAddressUseCase,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async deleteWalletAddress(walletAddressId: string, body: DeleteWalletAddressByAdminRequest) {
    this.log.debug(`Start implement deleteWalletAddress: ${walletAddressId}`);
    const merchantManager = await this.adminProfileService.findOneById(body.managerId, OperationType.MERCHANT_MANAGER);
    if (!merchantManager) {
      return OperationError.MERCHANT_NOT_FOUND;
    }
    const result = await this.deleteManagerWalletAddressUseCase.deleteWalletAddress(merchantManager, walletAddressId);
    this.log.debug(`Stop implement deleteWalletAddress: ${walletAddressId}`);
    return result;
  }
}
