import { ShiftService } from '@api/shift/services/ShiftService';
import * as express from 'express';
import { Service } from 'typedi';
import { ExportReportRequest } from '../requests/ExportReportRequest';

@Service()
export class ExportShiftReportUseCase {
  constructor(private readonly shiftService: ShiftService) {}

  public async exportShiftReport(operationId: string, exportReportRequest: ExportReportRequest, res: express.Response) {
    return await this.shiftService.exportShiftReport(operationId, exportReportRequest, res);
  }
}
