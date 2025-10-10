import * as topics from 'p2p-common/topics.json';
import { Service } from 'typedi';
import { Topics } from '../types/telegrambot';

@Service()
export class GetTopicsUseCase {
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
