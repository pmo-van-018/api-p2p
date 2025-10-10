import { OperationStatus } from '@api/common/models/P2PEnum';
import { Operation } from '@api/profile/models/Operation';
import { PublicViewAdjustment } from '@api/statistic/models/PublicViewAdjustment';
import { WalletAddressManagement } from '@api/profile/models/WalletAddressManagement';
import { WalletAddressInfoResponse } from '@api/profile/responses/WalletAddressInfoResponse';
class PublicViewAdjustmentResponse {
  public totalOrderCompleted: number;
  public totalRateCompleted: number;

  constructor(data: PublicViewAdjustment) {
    this.totalOrderCompleted = data.totalOrderCompleted;
    this.totalRateCompleted = data.totalRateCompleted;
  }
}

export class MerchantManagerInfoResponse {
  public id: string;
  public registeredMembers?: number;
  public maxMembers: number;
  public contractFrom: Date;
  public contractTo: Date;
  public walletAddressManagements: WalletAddressInfoResponse[];
  public walletAddress: string;
  public nickName: string;
  public status: string;
  public allowGasless?: boolean;
  public gaslessTransLimit?: number;
  public createdAt: Date;
  public updatedAt: Date;
  public avatar?: string;
  public publicViewAdjustments?: PublicViewAdjustmentResponse;

  constructor(data: { merchantManager: Operation; walletAddressManagements: WalletAddressManagement[], staffCount: number, publicViewAdjustments: PublicViewAdjustment }) {
    const { merchantManager, walletAddressManagements, staffCount, publicViewAdjustments } = data;
    this.id = merchantManager.id;
    this.walletAddress = merchantManager.walletAddress;
    this.nickName = merchantManager.nickName;
    this.status = OperationStatus[merchantManager.status];
    this.allowGasless = merchantManager.allowGasless;
    this.gaslessTransLimit = merchantManager.gaslessTransLimit;
    this.createdAt = merchantManager.createdAt;
    this.updatedAt = merchantManager.updatedAt;
    this.registeredMembers = staffCount;
    this.maxMembers = merchantManager.masterDataLevel?.maxMerchantOperator;
    this.contractFrom = merchantManager.contractFrom;
    this.contractTo = merchantManager.contractTo;
    this.walletAddressManagements = walletAddressManagements.map((wallet) => new WalletAddressInfoResponse(wallet));
    this.avatar = merchantManager.avatar;
    this.publicViewAdjustments = publicViewAdjustments;
  }
}
