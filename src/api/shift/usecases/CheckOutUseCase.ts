import { TRANSACTION_DEFAULT_OPTIONS } from '@api/common/constants/TransactionConstant';
import { SharedOrderService } from '@api/order/services/order/SharedOrderService';
import { Operation } from '@api/profile/models/Operation';
import { ShiftError } from '@api/shift/errors/ShiftError';
import { ShiftStatus } from '@api/shift/models/Shift';
import { CheckoutRequest } from '@api/shift/requests/CheckoutRequest';
import { ShiftService } from '@api/shift/services/ShiftService';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import moment from 'moment';
import { Service } from 'typedi';
import { Transactional } from 'typeorm-transactional-cls-hooked';

@Service()
export class CheckOutUseCase {
  constructor(
    private readonly shiftService: ShiftService,
    private readonly sharedOrderService: SharedOrderService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  public async checkOut(currentUser: Operation, checkoutRequest: CheckoutRequest) {
    this.log.debug(`Start implement checkOut method for ${currentUser.type}, ${currentUser.walletAddress}`);
    await this.shiftService.lockOperationPessimistic(currentUser.id);
    const shiftProcessing = await this.shiftService.getShiftProcessing(currentUser.id);
    if (!shiftProcessing) {
      return ShiftError.NOT_CHECKED_IN_BEFORE;
    }
    const balances = await this.shiftService.getBalanceAmountByAssetIds(currentUser.walletAddress);
    const isMatch = balances.every((item) => {
      return item.balance === checkoutRequest.assetBalances.find((asset) => asset.assetId === item.assetId)?.balance;
    });
    if (!isMatch) {
      return ShiftError.BALANCE_DOES_NOT_MATCH;
    }
    shiftProcessing.checkOutAt = moment().utc().toDate();
    const totalPrice = await this.sharedOrderService.countOrderAmountTotalByShift(
      currentUser.id,
      shiftProcessing.checkInAt,
      shiftProcessing.checkOutAt
    );
    shiftProcessing.endBalanceAmount = balances;
    shiftProcessing.totalVolume = totalPrice;
    shiftProcessing.status = ShiftStatus.FINISHED;
    await this.shiftService.updateShift(shiftProcessing.id, shiftProcessing);
    this.log.debug(`Stop implement checkOut method for: ${currentUser.type} - ${currentUser.walletAddress}`);
    return shiftProcessing;
  }
}
