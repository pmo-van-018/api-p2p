import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { UserProfileService } from '@api/profile/services/UserProfileService';
import moment from 'moment';

@Service()
export class SkipSystemNoteUseCase {
  constructor(
    private userProfileService: UserProfileService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async skipNote(userId: string) {
    this.log.debug(`Start implement SkipSystemNoteUseCase: ${userId}`);
    await this.userProfileService.updateSkipSystemNote(userId, moment().utc().toDate());
    this.log.debug(`Stop implement SkipSystemNoteUseCase: ${userId}`);
  }
}
