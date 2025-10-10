import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import { NewsService } from '@api/news/services/NewsServices';
import { Operation } from '@api/profile/models/Operation';
import { CreateNewsRequest } from '../requests/CreateNewsRequest';

@Service()
export class CreateNewsUseCase {
    constructor(
        private newsService: NewsService,
        @Logger(__filename) private log: LoggerInterface
    ) { }

    public async createNews(requestUser: Operation, request: CreateNewsRequest): Promise<boolean> {
        this.log.debug(`Start implement createNews for: ${requestUser.id} and roles: ${requestUser.type}`);
        try {
            await this.newsService.createNews(request);
            return true;
        }
        catch (error) {
            this.log.error(`Error on createNews for: ${requestUser.id} and roles: ${requestUser.type}: error: ${error}`);
            return false
        }
    }
}
