import { Appeal } from '@api/appeal/models/Appeal';
import { AppealRepository } from '@api/appeal/repositories/AppealRepository';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export class BaseAppealService {
  constructor(
    @InjectRepository() protected readonly appealRepository: AppealRepository
  ) {}

  public async getAppealById(id: string, includeOrder?: boolean): Promise<Appeal | null> {
    return await this.appealRepository.findOne({
      where: { id },
      ... includeOrder && { relations: ['order'] },
    });
  }

  public async getDetailAppeal(id: string): Promise<Appeal | null> {
    return await this.appealRepository.getDetailAppeal(id);
  }

  public async getParticipants(id: string): Promise<Appeal | null> {
    return await this.appealRepository.getParticipantsByAppealId(id);
  }

  public async countOpenAppeal(unassignedOnly: boolean): Promise<number> {
    return this.appealRepository.countOpenAppeal(unassignedOnly);
  }
}
