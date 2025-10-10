import { ASSET_NAMES, BLOCKCHAIN_NETWORKS, FileFormat } from '@api/common/models';
import { SHIFT_LOGS_FILE } from '@api/constant/report';
import { SharedResourceService } from '@api/master-data/services/SharedResourceService';
import { SharedBlockchainTransactionService } from '@api/order/services/SharedBlockchainTransactionService';
import { isTronWalletAddress } from '@api/order/services/TronService';
import { SharedProfileService } from '@api/profile/services/SharedProfileService';
import { Shift, ShiftStatus } from '@api/shift/models/Shift';
import { ShiftRepository } from '@api/shift/repositories/ShiftRepository';
import { ExportReportRequest } from '@api/shift/requests/ExportReportRequest';
import { GetShiftHistoriesRequest } from '@api/shift/requests/GetShiftHistoriesRequest';
import { ManagerGetShiftsRequest } from '@api/shift/requests/ManagerGetShiftsRequest';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import {
  attachCSVFileToResponse,
  streamExcelFileToResponse,
} from '@base/utils/helper.utils';
import BigNumber from 'bignumber.js';
import * as express from 'express';
import * as csv from 'fast-csv';
import moment from 'moment';
import { pipeline } from 'stream/promises';
import { Service } from 'typedi';
import { UpdateResult } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { ShiftCriteria } from '../types/ShiftCriteria';
import { env } from '@base/env';
import { AssetBalance } from '@api/shift/types/AssetBalance';

@Service()
export class ShiftService {
  constructor(
    @InjectRepository() private shiftRepository: ShiftRepository,
    private sharedOperationService: SharedProfileService,
    private sharedBlockchainTransactionService: SharedBlockchainTransactionService,
    private sharedResourceService: SharedResourceService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getLatestShiftByOperationId(operationId: string): Promise<Shift> {
    return await this.shiftRepository.getLatestShiftByOperationId(operationId);
  }

  public async isShiftProcessing(operationId: string): Promise<boolean> {
    const shiftProcessing = await this.shiftRepository.getShiftProcessingByOperatorId(operationId);
    return !!shiftProcessing;
  }

  public async getShiftProcessing(operationId: string): Promise<Shift> {
    this.log.debug(`Start implement getShiftProcessing with operationId: ${operationId}`);
    const shiftProcessing = await this.shiftRepository.getShiftProcessingByOperatorId(operationId);
    this.log.debug(`Stop implement getShiftProcessing with operationId: ${operationId}`);
    return shiftProcessing;
  }

  public async lockOperationPessimistic(operationId: string): Promise<void> {
    this.log.debug(`Start implement lockOperationPessimistic with operationId: ${operationId}`);
    await this.sharedOperationService.lockOperationPessimistic(operationId);
    this.log.debug(`Stop implement lockOperationPessimistic with operationId: ${operationId}`);
  }

  public async createNewShift(shift: Shift): Promise<Shift> {
    return await this.shiftRepository.createNewShift(shift);
  }

  public async updateShift(shiftId: string, shift: Shift) {
    this.log.debug(`Start implement updateShift with shiftId: ${shiftId} and shift: ${JSON.stringify(shift)}`);
    await this.shiftRepository.updateShift(shiftId, shift);
    this.log.debug(`Stop implement updateShift with shiftId: ${shiftId} and shift: ${JSON.stringify(shift)}`);
  }

  public async getBalanceAmountByAssetIds(address: string): Promise<AssetBalance[]> {
    this.log.debug(`Start implement getBalanceAmountByAssetIds with address: ${address}`);
    let assets = await this.sharedResourceService.getAssets();
    if (isTronWalletAddress(address)) {
      assets = assets.filter((asset) => asset.network === BLOCKCHAIN_NETWORKS.TRON);
    } else {
      assets = assets.filter((asset) => asset.network !== BLOCKCHAIN_NETWORKS.TRON);
    }
    const balances = await Promise.all(
      assets.map((asset) => {
        return this.sharedBlockchainTransactionService.getBalanceByAsset(address, asset);
      })
    );
    const result: AssetBalance[] = balances.map((balance, index) => {
      const asset = assets[index];
      return {
        assetId: asset?.id,
        assetName: asset?.name,
        assetNetwork: asset?.network,
        balance,
      };
    });
    this.log.debug(`Stop implement getBalanceAmountByAssetIds with address: ${address}`);
    return result;
  }

  public async getShiftDetailByManagerId(managerId: string, shiftId: string): Promise<Shift> {
    return await this.shiftRepository.getShiftDetailByManagerId(managerId, shiftId);
  }

  public async approveShift(managerId: string, criteria: ShiftCriteria): Promise<UpdateResult> {
    return await this.shiftRepository.updateShiftStatus(managerId, criteria, ShiftStatus.APPROVED);
  }

  public async getMyShiftHistories(operationId: string, shiftHistoriesRequest: GetShiftHistoriesRequest) {
    return await this.shiftRepository.getMyShiftHistories(operationId, shiftHistoriesRequest);
  }

  public async getShiftsByManager(managerId: string, request: ManagerGetShiftsRequest) {
    return await this.shiftRepository.getShiftsByManager(managerId, request);
  }

  public async exportShiftReport(
    managerId: string,
    exportReportRequest: ExportReportRequest,
    response: express.Response
  ) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<any>(async (resolve, reject) => {
      let stt = 1;
      const queryStream = await this.shiftRepository.exportShiftReport(managerId, exportReportRequest);
      const headers = [
        'STT',
        'Giao dịch viên',
        'Địa chỉ ví',
        'Thời gian nhận ca',
        'Thời gian giao ca',
        'Số dư đầu ca (USDT)',
        'Số dư cuối ca (USDT)',
        'Số dư đầu ca (VIC)',
        'Số dư cuối ca (VIC)',
        'Khối lượng giao dịch (VND)',
        'Thời gian làm việc',
      ];
      switch (exportReportRequest.fileFormat) {
        case FileFormat.CSV: {
          attachCSVFileToResponse(SHIFT_LOGS_FILE, response);
          const formatStream = csv
            .format({
              headers,
            })
            .transform((row: any) => {
              return this.getContentFile(stt++, row);
            });
          await pipeline(queryStream, formatStream, response);
          queryStream.on('end', () => formatStream.end());
          formatStream.on('end', () => resolve(response));
          formatStream.on('error', (error) => reject(error));
          break;
        }
        case FileFormat.EXCEL: {
          await streamExcelFileToResponse(response, queryStream, {
            filename: SHIFT_LOGS_FILE,
            headers,
            buildContentRow: (row) => this.getContentFile(stt++, row),
          });
          break;
        }
        default:
          break;
      }
    });
  }

  private getContentFile(stt: number, row: any) {
    const durationTime = moment.duration(
      moment.utc(row.shift_check_out_at).diff(moment.utc(row.shift_check_in_at), 'minutes', true),
      'minutes'
    );
    let usdtBalanceStartShift = 0;
    let usdtBalanceEndShift = 0;
    let vicBalanceStartShift = 0;
    let vicBalanceEndShift = 0;
    (row.shift_start_balance_amount as AssetBalance[])?.forEach((assetBalance) => {
      if (assetBalance.assetName === ASSET_NAMES.USDT) {
        usdtBalanceStartShift = BigNumber(assetBalance.balance).plus(usdtBalanceStartShift).toNumber();
      } else if (assetBalance.assetName === ASSET_NAMES.VIC) {
        vicBalanceStartShift = BigNumber(assetBalance.balance).plus(vicBalanceStartShift).toNumber();
      }
    });
    (row.shift_end_balance_amount as AssetBalance[])?.forEach((assetBalance) => {
      if (assetBalance.assetName === ASSET_NAMES.USDT) {
        usdtBalanceEndShift = BigNumber(assetBalance.balance).plus(usdtBalanceEndShift).toNumber();
      } else if (assetBalance.assetName === ASSET_NAMES.VIC) {
        vicBalanceEndShift = BigNumber(assetBalance.balance).plus(vicBalanceEndShift).toNumber();
      }
    });
    return [
      stt++,
      `${row.operation_nick_name} ${row.operation_deleted_at ? ' (Đã xóa)' : ''}`,
      row.operation_wallet_address,
      moment(row.shift_check_in_at).utcOffset(env.app.timeZone).format('DD-MM-YYYY HH:mm:ss'),
      moment(row.shift_check_out_at).utcOffset(env.app.timeZone).format('DD-MM-YYYY HH:mm:ss'),
      usdtBalanceStartShift,
      usdtBalanceEndShift,
      vicBalanceStartShift,
      vicBalanceEndShift,
      Number(row.shift_total_volume),
      `${durationTime?.hours().toString().padStart(2, '0')}:${durationTime?.minutes().toString().padStart(2, '0')}`,
    ];
  }
}
