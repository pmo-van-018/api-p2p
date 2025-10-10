import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { NewsRepository } from "../repositories/NewsRepository";
import { News } from "../models/News";
import { CreateNewsRequest } from "../requests/CreateNewsRequest";
import { P2PError } from "@api/common/errors/P2PError";
import { ValidateError } from "@api/news/errors/ValidateError";
import { LessThanOrEqual, MoreThanOrEqual } from "typeorm";

@Service()
export class NewsService {
    constructor(@InjectRepository() private newsRepository: NewsRepository) { }

    public async getNewsByUser(): Promise<News[]> {
        return await this.newsRepository.find({
            where: {
                start: LessThanOrEqual(new Date()),
                end: MoreThanOrEqual(new Date())
            },
            order: {
                start: 'DESC'
            }
        });
    }

    public async getNewsByAdmin(): Promise<News[]> { 
        return await this.newsRepository.find({
            order: { start: 'DESC' }
        });
    }

    public async createNews(request: CreateNewsRequest) {
        const news = new News();
        news.content = request.content;
        news.start = request.start;
        news.end = request.end;
        return await this.newsRepository.save(news);
    }

    public async deleteNews(newsId: string) {
        const news = await this.newsRepository.findOne(newsId);
        if (!news) {
            throw new P2PError(ValidateError.NEWS_NOT_FOUND);
        }
        return await this.newsRepository.remove(news);
    }
}
