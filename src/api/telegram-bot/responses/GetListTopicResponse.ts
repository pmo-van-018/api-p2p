import { Topics } from '@api/telegram-bot/types/telegrambot';

export class GetListTopicResponse {
  public topics: { [key: string]: Topics[] };

  constructor(data: { [key: string]: Topics[] }) {
    this.topics = data;
  }
}
