import { ShiftStatus } from '@api/shift/models/Shift';
import { ShiftService } from '@api/shift/services/ShiftService';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';

@Service()
export class GetShiftStatusUseCase {
  constructor(private readonly shiftService: ShiftService, @Logger(__filename) private log: LoggerInterface) {}

  public async getCurrentShiftStatusOfOperationId(operationId: string) {
    this.log.debug(`Start implement getCurrentShiftStatusOfOperationId with operationId: ${operationId}`);
    const latestShift = await this.shiftService.getLatestShiftByOperationId(operationId);
    const isProcessing = latestShift && latestShift.status === ShiftStatus.PROCESSING;
    this.log.debug(`Stop implement getCurrentShiftStatusOfOperationId with operationId: ${operationId}`);
    return !!isProcessing;
  }
}
