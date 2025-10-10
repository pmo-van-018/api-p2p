import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Helper } from '@api/infrastructure/helpers/Helper';
import { ChartParamsRequest } from '@api/statistic/requests/ChartParamsRequest';
import { Operation } from '@api/profile/models/Operation';
import { VolumeService } from '@api/statistic/services/VolumeService';

@Service()
export class ExportChartByAdminUseCase {
  constructor(
    private volumeService: VolumeService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async exportChart(currentUser: Operation, chartParamsRequest: ChartParamsRequest) {
    this.log.debug(`Start implement exportChart with params: ${JSON.stringify(chartParamsRequest)}`);
    const contents = [];
    const headers = ['Thời Gian', 'Khối Lượng Giao Dịch (VND)', 'Phí Giao Dịch (VND)', 'Phí Phạt (VND)'];
    const type = chartParamsRequest.type;
    const data = await this.volumeService.getVolumesByOperation(chartParamsRequest, currentUser.id, currentUser.type);
    const isEmpty = data.every((e) => Number(e.amountTransaction) === 0 && Number(e.totalFee) === 0 && Number(e.totalPenaltyFee) === 0);
    if (isEmpty) {
      return null;
    }
    const volumes = data && data.length ? this.volumeService.handleVolumeData({ data, type }) : [];
    if (volumes?.length) {
      volumes.forEach((e) => {
        const contentArr = [e.time, e.amount_transaction, e.total_fee, e.total_penalty_fee];
        const contentStr = contentArr.toString() + '\n';
        contents.push(contentStr);
      });
    }
    if (!contents.length) {
      return null;
    }

    this.log.debug(`Stop implement exportChart with params: ${JSON.stringify(chartParamsRequest)}`);
    return await Helper.createCSV(headers.toString(), contents);
  }
}
