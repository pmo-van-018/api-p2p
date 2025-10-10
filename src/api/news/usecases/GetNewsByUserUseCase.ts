import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import { NewsService } from '@api/news/services/NewsServices';

@Service()
export class GetNewsByUsersUseCase {
    constructor(
        private newsService: NewsService,
        @Logger(__filename) private log: LoggerInterface
    ) { }

    public async getNewsByUser() {
        try {
            return await this.newsService.getNewsByUser();
        }
        catch (error) {
            this.log.error(`Error on getNewsByUser error: ${error}`);
            return false
        }
    }
}
