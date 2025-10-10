import { SupportRequestRepository } from '@api/support-request/repositories/SupportRequestRepository';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export class SharedSupportRequestService {
  constructor(
    @InjectRepository() private supportRequestRepository: SupportRequestRepository
  ) {}

  public async countSupportRequestReceivedByAdminIds(adminIds: string[]) {
    return await this.supportRequestRepository.countSupportRequestReceivedByAdminIds(adminIds);
  }
}
