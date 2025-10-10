import {attachCSVFileToResponse, attachExcelFileToResponse, streamExcelFileToResponse} from '@base/utils/helper.utils';
import { STATISTIC_USER_FILE } from '@api/constant/report';
import * as csv from 'fast-csv';
import { pipeline } from 'stream/promises';
import * as express from 'express';
import { ReadStream } from 'typeorm/platform/PlatformTools';
import { FileFormat, OperationType, ReportType, UserType } from '@api/common/models';
import { PassThrough } from 'stream';
import ExcelJS from 'exceljs';
import {
  formatAssetRevenueReport,
  formatManagerStatisticReport,
  formatOperatorStatisticReport,
  formatOrderHistoryReport,
  formatPostHistoryReport,
  formatRevenueReport,
  formatSupporterStatisticReport,
  formatTradeTypeDifferenceReport, getAssetReportHeader,
  getManagerStatisticReportHeader,
  getOrderHistoryHeaderInfo,
  getPostHistoryHeader,
  getRevenueReportHeader,
  getStaffStatisticReportHeader,
  getTradeTypeDifferenceReportHeader
} from '@base/utils/format-report-file.util';
import { User } from '@api/profile/models/User';
import { env } from '@base/env';
import moment from 'moment';
import { Helper } from '@api/infrastructure/helpers/Helper';
import { Asset } from '@api/master-data/models/Asset';

export async function exportUserStatisticReport(
  assets: Asset[],
  orderStatistics: any[],
  userInfo: User,
  fileFormat: FileFormat,
  response: express.Response,
  totalReferred?: number
) {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<any>(async (resolve, _reject) => {
    const headers = ['Địa chỉ ví', 'Tên hiển thị', 'Tổng giao dịch', 'Số giao dịch thành công'];
    const contents: any[] = [userInfo.walletAddress, userInfo.nickName];
    let totalOrder = 0;
    let totalOrderCompleted = 0;
    let totalFiatPrice = 0;
    orderStatistics?.forEach((od) => {
      totalOrder += Number(od?.total_order) || 0;
      totalOrderCompleted += Number(od?.total_order_completed) || 0;
      totalFiatPrice += Number(od?.total_price) || 0;
    });
    contents.push(totalOrder);
    contents.push(totalOrderCompleted);
    assets.forEach((asset) => {
      const title = `Số lượng giao dịch ${asset.name} (${asset.network})`;
      headers.push(title);
      const assetStatistic = orderStatistics?.find((e) => e.asset_id === asset.id);
      contents.push(Number(assetStatistic?.total_amount) || 0);
    });
    headers.push('Tổng khối lượng giao dịch (VND)');
    contents.push(totalFiatPrice);
    if (env.referral.enable) {
      headers.push('Số người đã giới thiệu');
      contents.push(totalReferred);
    }

    headers.push('Ngày tham gia');
    contents.push(moment(userInfo.createdAt).utcOffset(env.app.timeZone).format('DD-MM-YYYY'));
    switch (fileFormat) {
      case FileFormat.CSV: {
        attachCSVFileToResponse(STATISTIC_USER_FILE, response);
        const result = await Helper.createCSV(headers.toString(), [contents.toString()]);
        resolve(result);
        break;
      }
      case FileFormat.EXCEL: {
        const bufferStream = new PassThrough();
        attachExcelFileToResponse(STATISTIC_USER_FILE, response);
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet1');
        if (contents.length) {
          if (!worksheet?.columns) {
            worksheet.columns = headers.map((header) => ({ header, key: header }));
            worksheet.getRow(1).font = { bold: true };
          }
          worksheet.addRow(contents);
          await workbook.xlsx.write(bufferStream);
        }
        bufferStream.end();
        bufferStream.pipe(response);
        break;
      }
      default:
        break;
    }
  });
}

export async function exportFile(
  queryStream: ReadStream,
  reportType: ReportType,
  userType: OperationType | UserType,
  fileFormat: FileFormat,
  filename: string,
  response: express.Response,
  dataFormat: object
) {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    let stt = 1;
    const {
      headers,
      nickNameColumnIndex,
      fiatColumnIndex,
      merchantWalletColumnIndex,
    } = getReportHeaderInfo(reportType, userType, (dataFormat as any).isOperator);
    switch (fileFormat) {
      case FileFormat.CSV: {
        attachCSVFileToResponse(filename, response);
        const formatStream = csv
          .format({
            headers,
          })
          .transform((row) => formatReport(reportType, {
            ...dataFormat,
            stt: stt++,
            row,
            nickNameColumnIndex,
            fiatColumnIndex,
            merchantWalletColumnIndex,
            userType,
          }));
        await pipeline(queryStream, formatStream, response);
        queryStream.on('end', () => formatStream.end());
        formatStream.on('end', () => resolve(response));
        formatStream.on('error', (error) => reject(error));
        break;
      }
      case FileFormat.EXCEL: {
        await streamExcelFileToResponse(response, queryStream, {
          filename,
          headers,
          buildContentRow: (row) => formatReport(reportType, {
            ...dataFormat,
            stt: stt++,
            row,
            nickNameColumnIndex,
            fiatColumnIndex,
            merchantWalletColumnIndex,
            userType,
          }),
        });
        break;
      }
      default:
        break;
    }
  });
}

function formatReport(reportType: ReportType, dataFormat: any) {
  switch (reportType) {
    case ReportType.ORDER_HISTORIES: return formatOrderHistoryReport(
      dataFormat.stt,
      dataFormat.row,
      dataFormat.userType,
      dataFormat.nickNameColumnIndex,
      dataFormat.merchantWalletColumnIndex,
      dataFormat.fiatColumnIndex
    );
    case ReportType.POST_HISTORIES: return formatPostHistoryReport(dataFormat.stt, dataFormat.userType, dataFormat.row);
    case ReportType.REVENUE: return formatRevenueReport(dataFormat.stt, dataFormat.row);
    case ReportType.ASSET: return formatAssetRevenueReport(dataFormat.stt, dataFormat.row, dataFormat.totalAmount);
    case ReportType.TRADE_TYPE_DIFFERENCE: return formatTradeTypeDifferenceReport(dataFormat.stt, dataFormat.row, dataFormat.totalAssets, dataFormat.userType);
    case ReportType.MANAGER_STATISTIC: return formatManagerStatisticReport(dataFormat.stt, dataFormat.row);
    case ReportType.STAFF_STATISTIC:
      if (dataFormat.isOperator) {
        return formatOperatorStatisticReport(dataFormat.stt, dataFormat.row);
      }
      return formatSupporterStatisticReport(dataFormat.stt, dataFormat.row, dataFormat.totalOrder);
    default: return null;
  }
}

function getReportHeaderInfo(reportType: ReportType, type: OperationType | UserType, isOperator: boolean) {
  let headerInfo = { headers: [], nickNameColumnIndex: 0, fiatColumnIndex: 0, merchantWalletColumnIndex: 0 };
  switch (reportType) {
    case ReportType.ORDER_HISTORIES:
      headerInfo = getOrderHistoryHeaderInfo(type);
      break;
    case ReportType.POST_HISTORIES:
      headerInfo.headers = getPostHistoryHeader(type as OperationType);
      break;
    case ReportType.REVENUE:
      headerInfo.headers = getRevenueReportHeader();
      break;
    case ReportType.ASSET:
      headerInfo.headers = getAssetReportHeader();
      break;
    case ReportType.TRADE_TYPE_DIFFERENCE:
      headerInfo.headers = getTradeTypeDifferenceReportHeader();
      break;
    case ReportType.MANAGER_STATISTIC:
      headerInfo.headers = getManagerStatisticReportHeader();
      break;
    case ReportType.STAFF_STATISTIC:
      headerInfo.headers = getStaffStatisticReportHeader(isOperator);
      break;
    default: break;
  }
  return headerInfo;
}
