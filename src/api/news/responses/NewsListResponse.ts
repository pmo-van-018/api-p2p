import { News } from '../models/News';

export class NewsBaseResponse {
  public id: string;
  public content: string;
  public start: Date;
  public end: Date;
  
  constructor(news: News) {
    this.id = news.id;
    this.content = news.content;
    this.start = news.start;
    this.end = news.end;
  }
}

export class NewsListResponse {
  public items: NewsBaseResponse[];

  constructor(news: News[]) {
    this.items = news.map((n) => new NewsBaseResponse(n));
  }
}
