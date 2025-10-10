import { OperationType } from '@api/common/models/P2PEnum';
import { Service } from 'typedi';
import { AdminAppealService } from '@api/appeal/services/AdminAppealService';
import { AppealError } from '@api/appeal/errors/AppealError';
import { Operation } from '@api/profile/models/Operation';

@Service()
export class GetAppealDetailUseCase {
  constructor(
    private adminAppealService: AdminAppealService
  ) {}

  public async getDetail(currentUser: Operation, appealId: string) {
    const appeal = await this.adminAppealService.getDetailAppeal(appealId);
    if (!appeal) {
      return AppealError.APPEAL_NOT_FOUND;
    }
    if (appeal.adminId !== currentUser.id && currentUser.type === OperationType.ADMIN_SUPPORTER) {
      return AppealError.ADMIN_SUPPORTER_VIEW_APPEAL_PERMISSION_DENIED;
    }
    return appeal;
  }
}
