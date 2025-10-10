import { PaginationResult } from '@api/common/types';
import { Operation } from '@api/profile/models/Operation';
import { Shift } from '@api/shift/models/Shift';
import { ManagerGetShiftsRequest } from '@api/shift/requests/ManagerGetShiftsRequest';
import { ShiftService } from '@api/shift/services/ShiftService';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';

@Service()
export class ManagerGetShiftsUseCase {
  constructor(private readonly shiftService: ShiftService, @Logger(__filename) private log: LoggerInterface) {}

  public async getShiftsByManager(
    currentUser: Operation,
    queryParams: ManagerGetShiftsRequest
  ): Promise<PaginationResult<Shift>> {
    this.log.debug(`Start implement getShiftsByManager with params: ${JSON.stringify(queryParams)}`);
    const [shifts, total] = await this.shiftService.getShiftsByManager(currentUser.id, queryParams);
    this.log.debug(`Stop implement getShiftsByManager with result: ${JSON.stringify(shifts)}`);
    return { items: shifts, totalItems: total };
  }
}
