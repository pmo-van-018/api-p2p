import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import {OperationType} from '@api/common/models';
import {OperationError} from '@api/errors/OperationError';
import {AddNewWalletAddressByAdminRequest} from '@api/profile/requests/AddNewWalletAddressByAdminRequest';
import {AdminProfileService} from '@api/profile/services/AdminProfileService';
import { AddWalletAddressUseCase as AddManagerWalletAddressUseCase } from '@api/profile/usecases/merchant/AddWalletAddressUseCase';

@Service()
export class AddWalletAddressUseCase {
  constructor(
    private adminProfileService: AdminProfileService,
    private addManagerWalletAddressUseCase: AddManagerWalletAddressUseCase,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async addWalletAddress(body: AddNewWalletAddressByAdminRequest) {
    this.log.debug(`Start implement addWalletAddress: ${body.managerId} with wallet address: ${body.walletAddress}`);
    const merchantManager = await this.adminProfileService.findOneById(body.managerId, OperationType.MERCHANT_MANAGER);
    if (!merchantManager) {
      return OperationError.MERCHANT_NOT_FOUND;
    }
    const result = await this.addManagerWalletAddressUseCase.addWalletAddress(merchantManager, { walletAddress: body.walletAddress });
    this.log.debug(`Stop implement addWalletAddress: ${body.managerId} with wallet address: ${body.walletAddress}`);
    return result;
  }
}
