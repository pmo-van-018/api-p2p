import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import { NewsService } from '@api/news/services/NewsServices';
import { UUIDParamRequest } from '@api/common/requests/BaseRequest';

@Service()
export class DeleteNewsUseCase {
    constructor(
        private newsService: NewsService,
        @Logger(__filename) private log: LoggerInterface
    ) { }

    public async deleteNews(request: UUIDParamRequest): Promise<boolean> {
        try {
            await this.newsService.deleteNews(request.id);
            return true;
        }
        catch (error) {
            this.log.error(`Error on deleteNews error: ${error}`);
            return false
        }
    }
}
