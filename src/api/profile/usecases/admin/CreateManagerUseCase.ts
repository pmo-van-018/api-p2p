import {Service} from 'typedi';
import {Logger, LoggerInterface} from '@base/decorators/Logger';
import {CreateNewMerchantManagerBodyRequest} from '@api/profile/requests/CreateNewMerchantManagerBodyRequest';
import {Operation} from '@api/profile/models/Operation';
import {OperationStatus, OperationType} from '@api/common/models';
import moment from 'moment';
import {getNicknameFromWalletAddress} from '@base/utils/p2p.utils';
import {SharedBlacklistService} from '@api/blacklist/services/SharedBlacklistService';
import {OperationWalletError} from '@api/profile/errors/OperationWallet';
import {OperationError} from '@api/errors/OperationError';
import {CheckWalletAddressIsExistUseCase} from '@api/profile/usecases/CheckWalletAddressIsExistUseCase';
import {CheckNickNameIsExistUseCase} from '@api/profile/usecases/CheckNickNameIsExistUseCase';
import {AdminProfileService} from '@api/profile/services/AdminProfileService';
import {getPeerChatId, USER_TYPE} from '@base/utils/chat.utils';
import {SharedStatisticService} from '@api/statistic/services/SharedStatisticService';
import {MerchantProfileService} from '@api/profile/services/MerchantProfileService';
import {Transactional} from 'typeorm-transactional-cls-hooked';
import {TRANSACTION_DEFAULT_OPTIONS} from '@api/common/constants/TransactionConstant';
import {WalletAddressManagementService} from '@api/profile/services/WalletAddressManagementService';

@Service()
export class CreateManagerUseCase {
  constructor(
    private blacklistService: SharedBlacklistService,
    private adminProfileService: AdminProfileService,
    private checkWalletAddressIsExistUseCase: CheckWalletAddressIsExistUseCase,
    private checkNickNameIsExistUseCase: CheckNickNameIsExistUseCase,
    private sharedStatisticService: SharedStatisticService,
    private merchantProfileService: MerchantProfileService,
    private walletAddressManagementService: WalletAddressManagementService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async createManager(body: CreateNewMerchantManagerBodyRequest) {
    this.log.debug(`Start implement createManager: ${JSON.stringify(body)}`);
    const { walletAddress, nickName, ...otherBody } = body;

    if (await this.blacklistService.isBlacklisted(walletAddress)) {
      return OperationWalletError.THE_WALLET_ADDRESS_IS_IN_THE_BLACKLIST;
    }

    const isWalletAddressExit = await this.checkWalletAddressIsExistUseCase.isExist(walletAddress);
    if (isWalletAddressExit) {
      return OperationError.STAFF_WALLET_ADDRESS_ALREADY_CREATED;
    }

    const isNickNameExit = await this.checkNickNameIsExistUseCase.isExist(nickName, OperationType.SUPER_ADMIN);
    if (isNickNameExit) {
      return OperationError.NICKNAME_IS_EXISTED;
    }

    const { contractFrom, contractTo } = this.adminProfileService.getDateContract(otherBody);

    const invalidDateContract = contractFrom && contractTo && contractFrom > contractTo;
    if (invalidDateContract) {
      return OperationError.DATE_CONTRACT_IS_INVALID;
    }

    const newMerchantManager = await this.createManagerTransaction({
      walletAddress,
      contractFrom,
      contractTo,
      type: OperationType.MERCHANT_MANAGER,
      activatedAt: moment.utc().toDate(),
      nickName: nickName ?? getNicknameFromWalletAddress(walletAddress),
      status: OperationStatus.ACTIVE,
    });
    this.log.debug(`Stop implement createManager: ${JSON.stringify(body)}`);
    return newMerchantManager.id;
  }

  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  private async createManagerTransaction(payload: Partial<Operation>) {
    const peerId = await getPeerChatId(USER_TYPE.USER);
    const newManager = await this.adminProfileService.createOperation(payload);
    const statisticId = await this.sharedStatisticService.createByOperationId(newManager.id);
    await this.merchantProfileService.updateStaffRelationship(newManager.id, statisticId, peerId);
    await this.walletAddressManagementService.createActiveWalletAddress(newManager.id, payload.walletAddress);
    return newManager;
  }
}
