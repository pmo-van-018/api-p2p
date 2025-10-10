import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import redisClient from '@base/utils/redis-client';
import { toStatusKey } from '@base/utils/redis-key';

@Service()
export class GetUserStatusUseCase {
  constructor(
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getStatus(identifiers: string[]) {
    this.log.debug(`Start implement getStatus for: ${JSON.stringify(identifiers)}`);
    if (!identifiers?.length) {
      return null;
    }
    const pipeline = redisClient.pipeline();
    identifiers.forEach((accountId) => {
      pipeline.get(toStatusKey(accountId));
    });
    const results = await pipeline.exec();
    this.log.debug(`Stop implement createSupportRequest for: ${JSON.stringify(identifiers)}`);
    return results
      .map((item: any[], index: number) => ({
        identifier: identifiers[index],
        status: !!item[1],
      }))
      .reduce((acc: { [x: string]: any; }, item: { identifier: string | number; status: any; }) => {
        acc[item.identifier] = item.status;
        return acc;
      }, {});
  }
}
