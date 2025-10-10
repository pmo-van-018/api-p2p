import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { MerchantProfileService } from '@api/profile/services/MerchantProfileService';
import { OperationError } from '@api/errors/OperationError';
import { Operation } from '@api/profile/models/Operation';
import { events } from '@api/subscribers/events';
import { SharedOrderService } from '@api/order/services/order/SharedOrderService';
import {SharedPostService} from '@api/post/services/SharedPostService';
import {SharedStatisticService} from '@api/statistic/services/SharedStatisticService';
import {SessionUtil} from '@base/utils/session.util';
import {SocketFactory} from '@api/sockets/SocketFactory';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { TRANSACTION_DEFAULT_OPTIONS } from '@api/common/constants/TransactionConstant';

@Service()
export class DeleteStaffUseCase {
  constructor(
    private merchantProfileService: MerchantProfileService,
    private sharedOrderService: SharedOrderService,
    private sharedPostService: SharedPostService,
    private sharedStatisticService: SharedStatisticService,
    private socketFactory: SocketFactory,
    @Logger(__filename) private log: LoggerInterface
  ) {}
 
  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  public async deleteStaff(currentUser: Operation, staffId: string) {
    this.log.debug(
      `Start implement inactiveStaff for ${currentUser.type} ${currentUser.walletAddress} and staff ${staffId}`
    );
    const staff = await this.merchantProfileService.findOneById(staffId);

    if (!staff || staff.merchantManagerId !== currentUser.id) {
      return OperationError.MERCHANT_NOT_FOUND;
    }

    const order = await this.sharedOrderService.getPendingOrderByOperation(staff.id, staff.type);
    if (order) {
      return this.merchantProfileService.isMerchantOperator(staff) ?
        OperationError.CANNOT_DISABLE_OPERATOR_HAS_PENDING_ORDER :
        OperationError.CANNOT_DISABLE_SUPPORTER_HAS_PENDING_ORDER;
    }
    await this.merchantProfileService.softDelete(staffId);
    if (this.merchantProfileService.isMerchantOperator(staff)) {
      const { total } = await this.sharedPostService.closeAllPostsOfMerchantOperator(staff.id);
      if (total) {
        await this.sharedStatisticService.updatePostCount(staff.id, false, total);
      }
    } else {
      await this.sharedOrderService.removeSupporterId(staff.id);
    }
    this.destroySessionAndSendNotify(staff);
    this.log.debug(
      `Stop implement inactiveStaff for ${currentUser.type} ${currentUser.walletAddress} and staff ${staffId}`
    );
    return null;
  }

  protected destroySessionAndSendNotify(staff: Operation) {
    SessionUtil.destroy(staff.id);
    // notify event to deacvivated operator
    this.socketFactory.emitToRoom(staff.walletAddress, {
      event: events.objects.user,
      action: events.actions.user.deleted,
    });
  }
}
