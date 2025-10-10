import { Service } from 'typedi';
import { AdminAppealService } from '@api/appeal/services/AdminAppealService';

@Service()
export class CountPickedAppealUseCase {
  constructor(
    private adminAppealService: AdminAppealService
  ) {}
  public async countPickedAppeal(adminId: string) {
    return this.adminAppealService.countPickedAppeal(adminId);
  }
}
