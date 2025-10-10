import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { MerchantProfileService } from '@api/profile/services/MerchantProfileService';
import { OperationStatus } from '@api/common/models';
import {MerchantError} from '@api/common/errors/MerchantError';
import {Operation} from '@api/profile/models/Operation';
import moment from 'moment';
import {getNicknameFromWalletAddress} from '@base/utils/p2p.utils';
import {CreateNewStaffRequest} from '@api/profile/requests/Merchants/CreateNewStaffRequest';
import {SharedBlacklistService} from '@api/blacklist/services/SharedBlacklistService';
import {OperationWalletError} from '@api/profile/errors/OperationWallet';
import {OperationError} from '@api/errors/OperationError';
import {UserProfileService} from '@api/profile/services/UserProfileService';
import {WalletAddressManagementService} from '@api/profile/services/WalletAddressManagementService';
import {AdminProfileService} from '@api/profile/services/AdminProfileService';
import {SharedMasterDataService} from '@api/master-data/services/SharedMasterDataService';
import {EntityBase} from '@api/infrastructure/abstracts/EntityBase';
import {SharedStatisticService} from '@api/statistic/services/SharedStatisticService';
import {getPeerChatId, USER_TYPE} from '@base/utils/chat.utils';

@Service()
export class CreateStaffUseCase {
  constructor(
    private merchantProfileService: MerchantProfileService,
    private userProfileService: UserProfileService,
    private sharedBlacklistService: SharedBlacklistService,
    private walletAddressManagementService: WalletAddressManagementService,
    private adminProfileService: AdminProfileService,
    private masterDataService: SharedMasterDataService,
    private statisticService: SharedStatisticService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async createStaff(currentUser: Operation, body: CreateNewStaffRequest) {
    const { status, walletAddress, nickName, ...otherData } = body;

    this.log.debug(
      `Start implement createNewStaff for ${currentUser.type} ${currentUser.walletAddress} and staff ${walletAddress}`
    );

    if (await this.sharedBlacklistService.isBlacklisted(walletAddress)) {
      return OperationWalletError.THE_WALLET_ADDRESS_IS_IN_THE_BLACKLIST;
    }

    // validate wallet address
    const operation = await this.merchantProfileService.findOneByWallet(walletAddress);
    if (operation) {
      return OperationError.STAFF_WALLET_ADDRESS_ALREADY_CREATED;
    }
    const user = await this.userProfileService.findOneByWallet(walletAddress);
    if (user) {
      return OperationError.STAFF_WALLET_ADDRESS_ALREADY_CREATED;
    }
    const walletManagement = await this.walletAddressManagementService.findWalletAddress(walletAddress);
    if (walletManagement) {
      return OperationError.STAFF_WALLET_ADDRESS_ALREADY_CREATED;
    }

    // validate nickname
    const adminProfile = await this.adminProfileService.findOneByNickName(nickName);
    if (adminProfile) {
      return OperationError.NICKNAME_IS_EXISTED;
    }
    if (nickName?.toLowerCase() === currentUser.nickName.toLowerCase()) {
      return OperationError.NICKNAME_IS_EXISTED;
    }
    const staff = await this.merchantProfileService.getStaffByNickName(currentUser.id, nickName);
    if (staff) {
      return OperationError.NICKNAME_IS_EXISTED;
    }

    // check whether current staffs is exceed the allowed limit
    const masterDataLevel = await this.masterDataService.getLatestMasterDataLevel(currentUser.merchantLevel);
    const staffNumber = await this.merchantProfileService.countStaff(
      currentUser.id,
      [OperationStatus.ACTIVE, OperationStatus.INACTIVE, OperationStatus.BLOCKED]
    );
    if (staffNumber >= masterDataLevel.maxMerchantOperator) {
      return MerchantError.STAFF_IS_EXCEED;
    }

    const newStaff = await this.createStaffTransaction({
      ...otherData,
      status,
      walletAddress,
      contractFrom: currentUser.contractFrom,
      contractTo: currentUser.contractTo,
      merchantManagerId: currentUser.id,
      merchantLevel: currentUser.merchantLevel,
      activatedAt: body.status === OperationStatus.ACTIVE ? moment.utc().toDate() : null,
      nickName: nickName ?? getNicknameFromWalletAddress(walletAddress),
    });

    this.log.debug(
      `Stop implement createNewStaff for ${currentUser.type} ${currentUser.walletAddress} and staff ${walletAddress}`
    );
    return newStaff.id;
  }

  private async createStaffTransaction(payload: Partial<Omit<Operation, keyof EntityBase | 'walletAddress'>> & { walletAddress: string; }) {
    const peerId = await getPeerChatId(USER_TYPE.USER);
    const staff = await this.merchantProfileService.createStaff(payload);
    const statisticId = await this.statisticService.createByOperationId(staff.id);
    await this.merchantProfileService.updateStaffRelationship(staff.id, statisticId, peerId);
    return staff;
  }
}
