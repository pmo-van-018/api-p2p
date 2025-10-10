import { TRANSACTION_DEFAULT_OPTIONS } from '@api/common/constants/TransactionConstant';
import { Operation } from '@api/profile/models/Operation';
import { ShiftError } from '@api/shift/errors/ShiftError';
import { Shift } from '@api/shift/models/Shift';
import { CheckInRequest } from '@api/shift/requests/CheckInRequest';
import { ShiftService } from '@api/shift/services/ShiftService';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { plainToInstance } from 'class-transformer';
import moment from 'moment';
import { Service } from 'typedi';
import { Transactional } from 'typeorm-transactional-cls-hooked';

@Service()
export class CheckInUseCase {
  constructor(private readonly shiftService: ShiftService, @Logger(__filename) private log: LoggerInterface) {}

  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  public async checkIn(currentUser: Operation, checkInRequest: CheckInRequest) {
    this.log.debug(`Start implement checkIn method for ${currentUser.type}, ${currentUser.walletAddress}`);
    await this.shiftService.lockOperationPessimistic(currentUser.id);
    const isShiftProcessing = await this.shiftService.isShiftProcessing(currentUser.id);
    if (isShiftProcessing) {
      return ShiftError.SHIFT_IS_PROCESSING;
    }
    const balances = await this.shiftService.getBalanceAmountByAssetIds(currentUser.walletAddress);
    const isMatch = balances.every((item) => {
      return item.balance === checkInRequest?.assetBalances?.find((asset) => asset.assetId === item.assetId)?.balance;
    });
    if (!isMatch) {
      return ShiftError.BALANCE_DOES_NOT_MATCH;
    }
    const newShift = plainToInstance(Shift, {
      operationId: currentUser.id,
      checkInAt: moment().utc().toDate(),
      startBalanceAmount: balances,
    });
    const result = await this.shiftService.createNewShift(newShift);
    this.log.debug(`Stop implement checkIn method for: ${currentUser.type} - ${currentUser.walletAddress}`);
    return result;
  }
}
