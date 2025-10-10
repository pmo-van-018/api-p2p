import { Service } from 'typedi';
import { AdminAppealService } from '@api/appeal/services/AdminAppealService';
import { Operation } from '@api/profile/models/Operation';
import { OperationType } from '@api/common/models';

@Service()
export class CountOpenAppealUseCase {
  constructor(
    private adminAppealService: AdminAppealService
  ) {}
  public async countOpenAppeal(currentUser: Operation) {
    const unassignedOnly = currentUser.type === OperationType.ADMIN_SUPPORTER;
    return this.adminAppealService.countOpenAppeal(unassignedOnly);
  }
}
