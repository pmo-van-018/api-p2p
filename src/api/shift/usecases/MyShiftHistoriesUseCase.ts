import { PaginationResult } from '@api/common/types';
import { GetShiftHistoriesRequest } from '@api/shift/requests/GetShiftHistoriesRequest';
import { ShiftService } from '@api/shift/services/ShiftService';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import { Shift } from '../models/Shift';

@Service()
export class MyShiftHistoriesUseCase {
  constructor(private readonly shiftService: ShiftService, @Logger(__filename) private log: LoggerInterface) {}

  public async getMyShiftHistories(
    operationId: string,
    shiftHistoriesRequest: GetShiftHistoriesRequest
  ): Promise<PaginationResult<Shift>> {
    this.log.debug(
      `Start implement getMyShiftHistories with operationId: ${operationId} and shiftHistoriesRequest: ${JSON.stringify(
        shiftHistoriesRequest
      )}`
    );
    const [items, totalItems] = await this.shiftService.getMyShiftHistories(operationId, shiftHistoriesRequest);
    this.log.debug(
      `Stop implement getMyShiftHistories with operationId: ${operationId} and shiftHistoriesRequest: ${JSON.stringify(
        shiftHistoriesRequest
      )}`
    );
    return {
      items,
      totalItems,
    };
  }
}
