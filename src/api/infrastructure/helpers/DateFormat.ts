import moment from 'moment';

export class DateFormat {
  public static formatDate(date: string, format: string = 'YYYY-MM-DD HH:MM:ss'): string {
    if (!date || !moment(date).isValid()) {
      return '';
    }
    return moment(new Date(date)).utc().format(format);
  }
  public static formatStartDate(date: string): string {
    return this.formatDate(date, 'YYYY-MM-DD 00:00:00');
  }
  public static formatEndDate(date: string): string {
    return this.formatDate(date, 'YYYY-MM-DD 23:59:59');
  }
}
