import {
  OperationStatus,
  OperationType,
} from '@api/common/models/P2PEnum';
import { Operation } from '@api/profile/models/Operation';
import moment from 'moment';
import { Service } from 'typedi';
import { InjectRepository} from 'typeorm-typedi-extensions';
import { OperationRepository } from '@api/profile/repositories/OperationRepository';
import {User} from "@api/profile/models/User";

@Service()
export class BaseProfileService {

  constructor(
    @InjectRepository() protected operationRepository: OperationRepository
  ) {}

  public async getOperationByWalletAddress(walletAddress: string) {
    return this.operationRepository.findOne({ where: { walletAddress }, withDeleted: true});
  }
  public isUserBlocked(operator: Operation): boolean {
    return (
      operator.status === OperationStatus.INACTIVE ||
      operator.status === OperationStatus.BLOCKED ||
      this.isUserViolateOrderRule(operator)
    );
  }

  public isUserDeleted(operation: Operation): boolean {
    return operation.status === OperationStatus.DELETED || !!operation.deletedAt;
  }

  public isUserViolateOrderRule(operator: Operation | User): boolean {
    return !(!operator.lockEndTime || moment.utc().toDate() > operator.lockEndTime);
  }

  public isMerchantOperator(operator: Operation): boolean {
    return operator.type === OperationType.MERCHANT_OPERATOR;
  }

  public isMerchantSupporter(operator: Operation): boolean {
    return operator.type === OperationType.MERCHANT_SUPPORTER;
  }

  public isAdmin(operator: Operation): boolean {
    return operator.type === OperationType.SUPER_ADMIN;
  }

  public isOperator(operatorOrId: Operation | number | string): operatorOrId is Operation {
    return !!(operatorOrId && (operatorOrId as Operation).id);
  }

  public isOperation(operationOrId: Operation | number | string): operationOrId is Operation {
    return !!(operationOrId && (operationOrId as Operation).id);
  }

  public isFirstActive(operator: Operation, status: Partial<OperationStatus>) {
    return operator.status === OperationStatus.INACTIVE && status === OperationStatus.ACTIVE && !operator.activatedAt;
  }

  public isUserWillInactive(operator: Operation, status?: OperationStatus): boolean {
    return (
      operator.status === OperationStatus.ACTIVE &&
      status &&
      (status === OperationStatus.INACTIVE || status === OperationStatus.BLOCKED)
    );
  }

  public isUserWillActive(operator: Operation, status?: OperationStatus): boolean {
    return this.isUserBlocked(operator) && status === OperationStatus.ACTIVE;
  }
}
