export type CronOptions = {
  timeZone?: string;
  utcOffset?: string | number;
  unrefTimeout?: boolean;
  name?: string;
};

export interface JobInterface {
  cronTime: string;
  cronOptions: CronOptions;
  execute(): Promise<void>;
}
