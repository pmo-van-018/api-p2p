import glob from 'glob';
import { Container } from 'typedi';
import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import { CronJob } from 'cron';
import { env } from '@base/env';
import { JobInterface } from '@api/common/schedulers/JobInterface';
import { Logger } from '@base/utils/logger';
import { ObjectType } from 'typedi/types/ObjectType';

const logger = new Logger(__filename);

export const schedulerLoader: MicroframeworkLoader = (settings: MicroframeworkSettings | undefined) => {
  if (settings) {
    const patterns = env.app.dirs.jobs;
    patterns.forEach((pattern) => {
      glob(pattern, (err: any, files: string[]) => {
        const cronJobs: CronJob[] = [];
        for (const file of files) {
          // eslint-disable-next-line @typescript-eslint/no-var-requires, security/detect-non-literal-require
          const jobClass: ObjectType<JobInterface> = require(file).default;
          const job = Container.get(jobClass);
          const cronJob = new CronJob(
            job.cronTime,
            job.execute.bind(job) as any,
            undefined,
            false,
            job.cronOptions.timeZone,
            undefined,
            false,
            job.cronOptions.utcOffset,
            job.cronOptions.unrefTimeout
          );
          cronJob.start();
          cronJobs.push(cronJob);
          logger.info(`Job ${jobClass.name} has been started: ${job.cronTime}.`);
        }
        settings.onShutdown(() => {
          cronJobs.map((cronJob) => cronJob.stop());
        });
      });
    });
  }
};
