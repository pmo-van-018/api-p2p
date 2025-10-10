import { SortOrder } from '@api/common/types';
import BigNumber from 'bignumber.js';

export class Helper {
  public static computeAmountBuyOrder(totalPrice: number, price: number, precision: number) {
    return this.trunc(new BigNumber(totalPrice).dividedBy(price).toNumber(), precision);
  }

  public static computeAmountSellOrder(totalPrice: number, price: number, precision: number) {
    return this.ceil(new BigNumber(totalPrice).dividedBy(price).toNumber(), precision);
  }

  public static trunc(value: number | string, precision: number) {
    const powNumber = new BigNumber(10).pow(precision).toNumber();
    const checkNumber = Math.trunc(new BigNumber(value).multipliedBy(powNumber).toNumber());
    return new BigNumber(checkNumber).dividedBy(powNumber).toNumber();
  }

  public static ceil(value: number | string, precision: number) {
    const powNumber = new BigNumber(10).pow(precision).toNumber();
    const checkNumber = Math.ceil(new BigNumber(value).multipliedBy(powNumber).toNumber());
    return new BigNumber(checkNumber).dividedBy(powNumber).toNumber();
  }

  public static plus(value1: number | string, value2: number | string) {
    return BigNumber(value1).plus(value2).toNumber();
  }

  public static round(value: number | string, precision: number, mathMethod: string = 'round') {
    const powNumber = new BigNumber(10).pow(precision).toNumber();
    const m = Number(new BigNumber(value).abs().multipliedBy(powNumber).toPrecision(15));
    return new BigNumber(Math[mathMethod](m))
      .dividedBy(powNumber)
      .multipliedBy(Math.sign(Number(value)))
      .toNumber();
  }

  public static normalizeStringToArray(text: string, separator: string = ','): string[] {
    if (!text) {
      return [];
    }
    return text
      .replace(/\s\s+/g, '')
      .split(separator)
      .filter((item) => !!item);
  }

  public static normalizeStringToSortObjectArray(
    text: string,
    sortOrder: SortOrder = 'ASC',
    separator: string = ','
  ): Record<string, SortOrder>[] {
    if (!text) { 
      return [];
    }
    return text.split(separator).map((v: string) => {
      const [property, order] = v.split(':');
      return { [property]: order ?? sortOrder.toUpperCase() };
    }) as Record<string, SortOrder>[];
  }

  public static computePercentCalculation(part: number, total: number, fractionDigits: number = 4): number {
    if (part === 0 || total === 0) {
      return 0;
    }
    if (part === total) {
      return 1;
    }
    const numberDivided = new BigNumber(part).dividedBy(total).toNumber();
    return this.trunc(numberDivided, fractionDigits);
  }

  public static formatDecimal(value: string, length: number): string {
    if (!value) {
      return '';
    }
    return parseFloat(value).toFixed(length);
  }

  public static async createCSV(headers: string, contents: string[]) {
    const headerCSV = headers + '\n';
    let contentCSV = '';
    contents.forEach((e) => {
      contentCSV += e;
    });
    const dataCSV = headerCSV + contentCSV;
    const file = Buffer.from(dataCSV, 'utf-8');
    return { file };
  }
}
