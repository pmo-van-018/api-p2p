import { Shift } from '@api/shift/models/Shift';

export class CheckInResponse {
  public readonly checkInAt: Date;
  public readonly checkOutAt: Date;
  public readonly orderAmount: number;

  constructor(shift: Shift) {
    this.checkInAt = shift.checkInAt;
    this.checkOutAt = shift.checkOutAt;
    this.orderAmount = shift.totalVolume;
  }
}
