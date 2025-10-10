import { OperationType } from '@api/common/models/P2PEnum';
import { Service } from 'typedi';
import { AdminAppealService } from '@api/appeal/services/AdminAppealService';
import { Appeal } from '@api/appeal/models/Appeal';
import { GetAppealListRequest } from '@api/appeal/requests/GetAppealListRequest';
import { PaginationResult } from '@api/common/types';
import { AdminFindConditions } from '@api/appeal/types/Appeal';
import { Operation } from '@api/profile/models/Operation';

@Service()
export class GetAppealListUseCase {
  constructor(
    private adminAppealService: AdminAppealService
  ) {}

  public async getList(currentUser: Operation, getListAppealRequest: GetAppealListRequest): Promise<PaginationResult<Appeal>> {
    const [appeals, total] = await this.adminAppealService.getListAppeal({
      ...getListAppealRequest,
      orderStatus: getListAppealRequest.orderStatus?.split(','),
      appealStatus: getListAppealRequest.appealStatus?.split(','),
      ...currentUser.type === OperationType.ADMIN_SUPPORTER && { adminId: getListAppealRequest.supporterId || null },
    } as AdminFindConditions);
    return {
      items: appeals,
      totalItems: total,
    };
  }
}
