import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { OperationType } from '@api/common/models';
import { AdminProfileService } from '@api/profile/services/AdminProfileService';
import { Operation } from '@api/profile/models/Operation';

@Service()
export class CheckNickNameIsExistUseCase {
  constructor(private adminProfileService: AdminProfileService, @Logger(__filename) private log: LoggerInterface) {}

  public async isExist(nickName: string, typeChecker: OperationType) {
    this.log.debug(`Start implement CheckNickNameIsExistUseCase: ${nickName}`);

    const isDuplicateAdminNickName = await this.adminProfileService.findOneByNickName(nickName);
    if (isDuplicateAdminNickName) {
      return true;
    }
    let operation: Operation;
    switch (typeChecker) {
      case OperationType.SUPER_ADMIN:
        operation = await this.adminProfileService.findOneStaffByNickName(nickName, [
          OperationType.ADMIN_SUPPORTER,
          OperationType.MERCHANT_MANAGER,
        ]);
        break;
      case OperationType.MERCHANT_MANAGER:
        operation = await this.adminProfileService.findOneStaffByNickName(nickName, [
          OperationType.MERCHANT_SUPPORTER,
          OperationType.MERCHANT_OPERATOR,
        ]);
        break;
      default:
        break;
    }
    this.log.debug(`Stop implement CheckNickNameIsExistUseCase: ${nickName}`);
    return !!operation;
  }
}
