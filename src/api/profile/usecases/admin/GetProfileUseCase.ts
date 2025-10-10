import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { UserError } from '@api/profile/errors/UserError';
import { AdminProfileService } from '@api/profile/services/AdminProfileService';
import { Operation } from '@api/profile/models/Operation';

@Service()
export class GetProfileUseCase {
  constructor(
    private adminProfileService: AdminProfileService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getProfile(currentUser: Operation) {
    this.log.debug(`Start implement getProfile: ${currentUser.id}`);
    const admin = await this.adminProfileService.findOneById(currentUser.id, currentUser.type);
    if (!admin) {
      return UserError.USER_NOT_FOUND;
    }
    this.log.debug(`Stop implement getProfile: ${currentUser.id}`);
    return admin;
  }
}
