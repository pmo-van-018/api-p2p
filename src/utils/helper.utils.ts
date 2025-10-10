/* eslint-disable @typescript-eslint/no-inferrable-types */
import moment from 'moment';
import * as express from 'express';
import { OperationType, TradeType } from '@api/common/models';
import { ErrorInfo, ErrorType } from '@api/infrastructure/helpers/ErrorInfo';
import { generate, charset } from 'voucher-code-generator';
import { env } from '@base/env';
import ExcelJS from 'exceljs';
import { PassThrough } from 'stream';
import { ReadStream } from 'typeorm/platform/PlatformTools';

const PREFIX_NICK_NAME = 'ANOTRADE';

export function generateRefId() {
  const refTime = moment();
  const refNumberRandom = randomIntFromInterval();

  return `${refTime.valueOf()}${refNumberRandom}`;
}

export function randomIntFromInterval(min: number = 1000000, max: number = 9999999) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function attachCSVFileToResponse(fileName: string, response: express.Response) {
  fileName = fileName + '.csv';
  response.set('Content-type', 'text/csv');
  response.attachment(fileName);
  return response;
}

export function attachExcelFileToResponse(fileName: string, response: express.Response) {
  fileName = fileName + '.xlsx';
  response.setHeader('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  response.attachment(fileName);
  return response;
}

export function streamExcelFileToResponse(
  response: express.Response,
  queryStream: ReadStream,
  options: {
    filename: string;
    headers: string[];
    buildContentRow: (row: any) => any;
  }
) {
  return new Promise<void>((resolve, reject) => {
    const { filename, headers, buildContentRow } = options;
    const bufferStream = new PassThrough();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');
    attachExcelFileToResponse(filename, response);
    queryStream.on('data', (row) => {
      if (!worksheet?.columns) {
        worksheet.columns = headers.map((header) => ({ header, key: header }));
        worksheet.getRow(1).font = { bold: true };
      }
      const content = buildContentRow(row);
      worksheet.addRow(content);
    });
    queryStream.on('end', async () => {
      const row = worksheet.getRow(1);
      if (row.findCell(1)) {
        await workbook.xlsx.write(bufferStream);
      }
      bufferStream.end();
      resolve();
    });
    queryStream.on('error', (error) => reject(error));
    bufferStream.pipe(response);
  });
}

export function formatDateTime(date: string | Date, format: string) {
  return moment(date).utcOffset(env.app.timeZone).format(format);
}

export function generateNickName(walletAddress: string) {
  return `${PREFIX_NICK_NAME}_${walletAddress.slice(walletAddress.length - 6, walletAddress.length)}`;
}

export function reverseTradeType(type: TradeType, role: number) {
  const roleReverse: number[] = [OperationType.MERCHANT_MANAGER, OperationType.MERCHANT_OPERATOR];
  if (roleReverse.includes(role)) {
    return type === TradeType.BUY ? TradeType.SELL : TradeType.BUY;
  }
  return type;
}

export function isErrorInfo(obj: any): obj is ErrorInfo {
  return (
    typeof obj === 'object' &&
    'key' in obj &&
    'type' in obj &&
    typeof obj['type'] === 'number' &&
    !!ErrorType[obj['type']]
  );
}
export function generateReferralCode() {
  return env.referral.enable
    ? generate({
        length: 8,
        charset: charset('alphanumeric'),
      })[0]
    : null;
}

export function generateSecretCode(prefix: string) {
  return (
    prefix +
    generate({
      length: 8,
      charset: charset('alphanumeric'),
    })[0]
  );
}

export function validateSecretCode(secretKey: string, prefix: string) {
  if (!secretKey.startsWith(prefix)) {
    return false;
  }
  const alphanumericRegexp = /^[a-z0-9]+$/i;
  const alphanumeric = secretKey.replace(prefix, '');
  return alphanumericRegexp.test(alphanumeric);
}

export function formatObjectKeysToNumber<T extends Record<string, any>>(obj: T): T {
  return Object.keys(obj).reduce((acc, key) => {
    acc[key] = Number(obj[key]);
    return acc;
  }, {} as any) as T;
}

export function getKeyByValue<T extends Record<string, any>>(enumObj: T, value: T[keyof T]): keyof T | undefined {
  const entries = Object.entries(enumObj) as [keyof T, T[keyof T]][];
  const entry = entries.find(([_, enumValue]) => enumValue === value);
  return entry?.[0];
}
