import { SupportRequestStatus } from '@api/support-request/models/SupportRequestEnum';
import { SupportRequest } from '@api/support-request/models/SupportRequest';
import { SupportRequestRepository } from '@api/support-request/repositories/SupportRequestRepository';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { SupportRequestQuery } from '@api/support-request/types/SupportRequest';

@Service()
export class SupportRequestService {
  constructor(
    @InjectRepository() private supportRequestRepository: SupportRequestRepository
  ) {}

  public async getSupportRequests(supportRequestList: SupportRequestQuery) {
    return await this.supportRequestRepository.getSupportRequests(supportRequestList);
  }

  public async getPendingSupportRequestByUser(userId: string) {
    return await this.supportRequestRepository.findOne({
      where: {
        status: SupportRequestStatus.PENDING,
        userId,
      },
    });
  }

  public async countPendingByAdmin(includeReceived: boolean) {
    return await this.supportRequestRepository.countPendingByAdmin(includeReceived);
  }

  public async saveSupportRequest(payload: SupportRequest) {
    return this.supportRequestRepository.save(payload);
  }

  public async countSupportRequestReceived(adminId: string) {
    return await this.supportRequestRepository.count({
      where: {
        status: SupportRequestStatus.PENDING,
        adminId,
      },
    });
  }

  public async resolveRequest(requestId: string) {
    return await this.supportRequestRepository.update(requestId, {
      status: SupportRequestStatus.COMPLETED,
      completedAt: new Date(),
    });
  }

  public async getSupportRequestByRefId(refId: string) {
    return await this.supportRequestRepository.findOne({
      where: {
        refId,
      },
      relations: ['user', 'admin'],
    });
  }

  public async receiveByAdminSupporter(requestRefId: string, adminId: string) {
    return await this.supportRequestRepository.update(requestRefId, { adminId });
  }
}
