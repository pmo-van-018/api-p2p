import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { CreateNewAdminSupporterBodyRequest } from '@api/profile/requests/CreateNewAdminSupporterBodyRequest';
import {SharedBlacklistService} from '@api/blacklist/services/SharedBlacklistService';
import {OperationWalletError} from '@api/profile/errors/OperationWallet';
import {OperationError} from '@api/errors/OperationError';
import {OperationStatus, OperationType} from '@api/common/models';
import {CheckWalletAddressIsExistUseCase} from '@api/profile/usecases/CheckWalletAddressIsExistUseCase';
import {CheckNickNameIsExistUseCase} from '@api/profile/usecases/CheckNickNameIsExistUseCase';
import {Transactional} from 'typeorm-transactional-cls-hooked';
import {TRANSACTION_DEFAULT_OPTIONS} from '@api/common/constants/TransactionConstant';
import {Operation} from '@api/profile/models/Operation';
import {getPeerChatId, USER_TYPE} from '@base/utils/chat.utils';
import {SharedStatisticService} from '@api/statistic/services/SharedStatisticService';
import {MerchantProfileService} from '@api/profile/services/MerchantProfileService';
import {WalletAddressManagementService} from '@api/profile/services/WalletAddressManagementService';
import {getNicknameFromWalletAddress} from '@base/utils/p2p.utils';
import moment from 'moment';
import {AdminProfileService} from '@api/profile/services/AdminProfileService';

@Service()
export class CreateAdminSupporterUseCase {
  constructor(
    private adminProfileService: AdminProfileService,
    private blacklistService: SharedBlacklistService,
    private checkWalletAddressIsExistUseCase: CheckWalletAddressIsExistUseCase,
    private checkNickNameIsExistUseCase: CheckNickNameIsExistUseCase,
    private sharedStatisticService: SharedStatisticService,
    private merchantProfileService: MerchantProfileService,
    private walletAddressManagementService: WalletAddressManagementService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async createNewAdminSupporter(body: CreateNewAdminSupporterBodyRequest) {
    const { walletAddress, nickName, status } = body;

    this.log.debug(`Start implement createNewAdminSupporter for ${JSON.stringify(body)}`);

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

    const adminSupporter = await this.createAdminSupporterTransaction({
      status,
      walletAddress,
      contractFrom: null,
      contractTo: null,
      type: OperationType.ADMIN_SUPPORTER,
      activatedAt: body.status === OperationStatus.ACTIVE ? moment().utc().toDate() : null,
      nickName: nickName ?? getNicknameFromWalletAddress(walletAddress),
    });

    this.log.debug(`Stop implement createNewAdminSupporter for ${JSON.stringify(body)}`);
    return adminSupporter.id;
  }

  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  private async createAdminSupporterTransaction(payload: Partial<Operation>) {
    const peerId = await getPeerChatId(USER_TYPE.ADMIN);
    const newAdminSupporter = await this.adminProfileService.createOperation(payload);
    const statisticId = await this.sharedStatisticService.createByOperationId(newAdminSupporter.id);
    await this.merchantProfileService.updateStaffRelationship(newAdminSupporter.id, statisticId, peerId);
    await this.walletAddressManagementService.createActiveWalletAddress(newAdminSupporter.id, payload.walletAddress);
    return newAdminSupporter;
  }
}
