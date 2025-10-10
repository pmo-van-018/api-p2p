import { TRANSACTION_DEFAULT_OPTIONS } from '@api/common/constants/TransactionConstant';
import { Service } from 'typedi';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { ShiftError } from '../errors/ShiftError';
import { ShiftStatus } from '../models/Shift';
import { ApproveShiftRequest } from '../requests/ApproveShiftRequest';
import { ShiftService } from '../services/ShiftService';
import { Operation } from '@api/profile/models/Operation';

@Service()
export class ApproveShiftUseCase {
  constructor(private readonly shiftService: ShiftService) {}

  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  public async approveByShiftId(currentUser: Operation, shiftId: string) {
    const shift = await this.shiftService.getShiftDetailByManagerId(currentUser.id, shiftId);
    if (!shift) {
      return ShiftError.SHIFT_NOT_FOUND;
    }

    if (shift.status !== ShiftStatus.FINISHED) {
      return ShiftError.STATUS_IS_INVALID;
    }

    return await this.shiftService.approveShift(currentUser.id, { shiftId, status: ShiftStatus.FINISHED });
  }

  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  public async approveShifts(currentUser: Operation, request: ApproveShiftRequest) {
    return await this.shiftService.approveShift(currentUser.id, {
      status: ShiftStatus.FINISHED,
      startDate: request.startDate,
      endDate: request.endDate,
      filterDateType: request.filterDateType,
      search: request.search,
      searchTextType: request.searchTextType,
    });
  }
}
