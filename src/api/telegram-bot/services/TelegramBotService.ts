import { AppealError } from '@api/appeal/errors/AppealError';
import { AppealRepository } from '@api/appeal/repositories/AppealRepository';
import { P2PError } from '@api/common/errors/P2PError';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import * as topics from 'p2p-common/topics.json';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Topics } from '../types/telegrambot';

@Service()
export class TelegramBotService {
  constructor(
    @InjectRepository() private appealRepository: AppealRepository,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getAppealDetail(secret: string): Promise<any> {
    this.log.debug('Start implement getAppealDetail method for secret: ', secret);
    const appeal = await this.appealRepository.findOne({
      where: { secret },
      relations: [
        'order',
        'order.asset',
        'order.merchant',
        'userWinner',
        'operationWinner',
        'order.merchant.merchantManager',
        'operationWinner.merchantManager',
      ],
    });

    if (!appeal) {
      throw new P2PError(AppealError.APPEAL_NOT_FOUND);
    }
    this.log.debug('Stop implement getAppealDetail method for secret: ', secret);
    return appeal;
  }

  public getTopics(): { [key: string]: Topics[] } {
    const { accountFaq, adsFaq, appealFaq, definitionsFaq, otherQuestion, transactionsFaq } = topics;
    return {
      accountFaq,
      adsFaq,
      appealFaq,
      definitionsFaq,
      otherQuestion,
      transactionsFaq,
    };
  }
}
