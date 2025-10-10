import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import { configure, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import ecsFormat from '@elastic/ecs-winston-format';
import { env } from '../env';

export const winstonLoader: MicroframeworkLoader = (settings: MicroframeworkSettings | undefined) => {
  const format = ecsFormat({
    apmIntegration: true,
    convertErr: true,
    convertReqRes: true,
  });
  configure({
    transports: [
      new transports.Console({
        level: env.log.level,
        handleExceptions: true,
        format,
      }),
      env.log.writeLogsToFile &&
        new DailyRotateFile({
          level: env.log.level,
          handleExceptions: true,
          format,
          dirname: __dirname + '/../../logs',
          filename: 'application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxFiles: env.log.maxFiles,
        }),
    ].filter(Boolean),
  });
};
