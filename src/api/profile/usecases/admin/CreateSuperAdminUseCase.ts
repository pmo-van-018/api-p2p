import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import {SharedBlacklistService} from '@api/blacklist/services/SharedBlacklistService';
import {OperationWalletError} from '@api/profile/errors/OperationWallet';
import {OperationError} from '@api/errors/OperationError';
import {OperationStatus, OperationType} from '@api/common/models';
import {CheckWalletAddressIsExistUseCase} from '@api/profile/usecases/CheckWalletAddressIsExistUseCase';
import {Transactional} from 'typeorm-transactional-cls-hooked';
import {TRANSACTION_DEFAULT_OPTIONS} from '@api/common/constants/TransactionConstant';
import {Operation} from '@api/profile/models/Operation';
import {SharedStatisticService} from '@api/statistic/services/SharedStatisticService';
import {MerchantProfileService} from '@api/profile/services/MerchantProfileService';
import {WalletAddressManagementService} from '@api/profile/services/WalletAddressManagementService';
import {getNicknameFromWalletAddress} from '@base/utils/p2p.utils';
import moment from 'moment';
import {AdminProfileService} from '@api/profile/services/AdminProfileService';
import { CreateNewSuperAdminBodyRequest } from '@api/profile/requests/CreateNewSuperAdminBodyRequest';
import { USER_TYPE, getPeerChatId } from '@base/utils/chat.utils';
import {SharedProfileService} from '@api/profile/services/SharedProfileService';

@Service()
export class CreateSuperAdminUseCase {
  constructor(
    private adminProfileService: AdminProfileService,
    private blacklistService: SharedBlacklistService,
    private sharedProfileService: SharedProfileService,
    private checkWalletAddressIsExistUseCase: CheckWalletAddressIsExistUseCase,
    private sharedStatisticService: SharedStatisticService,
    private merchantProfileService: MerchantProfileService,
    private walletAddressManagementService: WalletAddressManagementService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async createSuperAdmin(body: CreateNewSuperAdminBodyRequest, currentUser: Operation) {
    const { walletAddress, nickName } = body;

    this.log.debug(`Start implement createSuperAdmin for ${JSON.stringify(body)}`);

    if (await this.blacklistService.isBlacklisted(walletAddress)) {
      return OperationWalletError.THE_WALLET_ADDRESS_IS_IN_THE_BLACKLIST;
    }

    const isWalletAddressExit = await this.checkWalletAddressIsExistUseCase.isExist(walletAddress);
    if (isWalletAddressExit) {
      return OperationError.STAFF_WALLET_ADDRESS_ALREADY_CREATED;
    }

    const isNickNameExit = await this.sharedProfileService.isExistNickName(nickName);
    if (isNickNameExit) {
      return OperationError.NICKNAME_IS_EXISTED;
    }

    const newSuperAdmin = await this.createSuperAdminTransaction({
      status: OperationStatus.ACTIVE,
      walletAddress,
      contractFrom: null,
      contractTo: null,
      type: OperationType.SUPER_ADMIN,
      activatedAt: moment().utc().toDate(),
      nickName: nickName ?? getNicknameFromWalletAddress(walletAddress),
      updatedBy: currentUser.id,
      createdBy: currentUser.id,
    });

    this.log.debug(`Stop implement createSuperAdmin for ${JSON.stringify(body)}`);
    return newSuperAdmin.id;
  }

  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  private async createSuperAdminTransaction(payload: Partial<Operation>) {
    const peerId = await getPeerChatId(USER_TYPE.ADMIN);
    const newAdmin = await this.adminProfileService.createOperation(payload);
    const statisticId = await this.sharedStatisticService.createByOperationId(newAdmin.id);
    await this.merchantProfileService.updateStaffRelationship(newAdmin.id, statisticId, peerId);
    await this.walletAddressManagementService.createActiveWalletAddress(newAdmin.id, payload.walletAddress);
    return newAdmin;
  }
}
