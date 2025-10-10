import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import { NewsService } from '@api/news/services/NewsServices';

@Service()
export class GetNewsByAdminUseCase {
    constructor(
        private newsService: NewsService,
        @Logger(__filename) private log: LoggerInterface
    ) { }

    public async getNewsByAdmin() {
        try {
            return await this.newsService.getNewsByAdmin();
        }
        catch (error) {
            this.log.error(`Error on getNewsByAdmin error: ${error}`);
            return false
        }
    }
}
