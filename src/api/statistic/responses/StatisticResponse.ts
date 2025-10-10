import { Statistic } from '@api/statistic/models/Statistic';

export class StatisticResponse {
  public postShownCount: number;
  public postHideCount: number;
  public totalOrderCount: number;
  public orderWaitingCount: number;
  public cancelOrderCount: number;
  public orderAppealCount: number;
  public orderWaitingUserCount: number;

  constructor(statistic: Statistic) {
    this.postShownCount = Number(statistic?.postShownCount);
    this.postHideCount = Number(statistic?.postHideCount);
    this.totalOrderCount = Number(statistic?.totalOrderCount);
    this.orderWaitingCount = Number(statistic?.orderWaitingCount);
    this.cancelOrderCount = Number(statistic?.cancelOrderCount);
    this.orderAppealCount = Number(statistic?.orderAppealCount);
    this.orderWaitingUserCount = Number(statistic?.orderWaitingUserCount);
  }
}
