import { Statistic } from '@api/statistic/models/Statistic';

export class StatisticBaseResponse {
  public postShownCount: number;
  public orderWaitingCount: number;
  public orderAppealCount: number;
  public orderWaitingUserCount: number;

  constructor(statistic: Statistic) {
    this.postShownCount = Number(statistic?.postShownCount) || 0;
    this.orderWaitingCount = Number(statistic?.orderWaitingCount) || 0;
    this.orderAppealCount = Number(statistic?.orderAppealCount) || 0;
    this.orderWaitingUserCount = Number(statistic?.orderWaitingUserCount) || 0;
  }
}
