import { Appeal } from '@api/appeal/models/Appeal';

export class CreateAppealResponse {
  public appealId: string;
  public inviteLink?: string;
  constructor(appeal: Appeal) {
    this.appealId = appeal.id;
  }
}
