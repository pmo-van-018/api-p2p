import { UserRepository } from '@api/profile/repositories/UserRepository';
import { UserViewByUser } from '@api/profile/types/User';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { NotificationType } from '@api/common/models';
import { GetListUsersByAdminParamsRequest } from '@api/profile/requests/GetListUsersByAdminParamsRequest';

@Service()
export class UserProfileService {
  constructor(
    @InjectRepository() private userRepository: UserRepository
  ) {}

  public async getUserProfileById(userId: string): Promise<UserViewByUser> {
    return await this.userRepository.getUserProfileByUserId(userId);
  }

  public async findOneById(id: string) {
    return await this.userRepository.findOne(id);
  }

  public async findOneByWallet(walletAddress: string) {
    return await this.userRepository.findOne({ where: { walletAddress}, withDeleted: true });
  }

  public async updateAllowNotification(userId: string, allowNotification: NotificationType[]) {
    await this.userRepository.update(userId, { allowNotification });
  }

  public async updateAvatar(userId: string, avatar: string) {
    await this.userRepository.update(userId, { avatar });
  }

  public async updateSkipSystemNote(userId: string, skipNoteAt: Date) {
    await this.userRepository.update(userId, { skipNoteAt });
  }

  public async getListUsersByAdmin(filter: GetListUsersByAdminParamsRequest) {
    return await this.userRepository.getListUsersByAdmin(filter);
  }
}
