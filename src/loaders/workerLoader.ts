import glob from 'glob';
import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import { Container } from 'typedi';
import { ObjectType } from 'typedi/types/ObjectType';

import { WorkerInterface } from '@api/workers/WorkerInterface';
import { env } from '@base/env';

export const workerLoader: MicroframeworkLoader = async (settings: MicroframeworkSettings | undefined) => {
  if (settings) {
    const patterns = env.app.dirs.workers;
    patterns.forEach((pattern) => {
      glob(pattern, (err: any, files: string[]) => {
        const workers: WorkerInterface[] = [];
        for (const file of files) {
          const serviceName = file.split('/').pop().replace('.ts', '');
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const workerClass: ObjectType<WorkerInterface> = require(file).default;
          if (workerClass) {
            Container.set(serviceName, workerClass);
            const worker = Container.get(workerClass);
            worker.start();
            workers.push(worker);
          }
        }
        settings.onShutdown(async () => {
          await Promise.all(workers.map((w) => w.stop()));
        });
      });
    });
  }
};
