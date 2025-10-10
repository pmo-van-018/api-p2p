import { Shift, ShiftStatus } from '@api/shift/models/Shift';
import { AssetBalance } from '@api/shift/types/AssetBalance';

export class BaseShiftResponse {
  public readonly id: string;
  public readonly checkInAt: Date;
  public readonly checkOutAt: Date;
  public readonly openingBalance: AssetBalance[];
  public readonly closingBalance: AssetBalance[];
  public readonly status: ShiftStatus;
  public readonly orderAmount: number;

  constructor(shift: Shift) {
    this.id = shift.id;
    this.checkInAt = shift.checkInAt;
    this.checkOutAt = shift.checkOutAt;
    this.openingBalance = shift.startBalanceAmount;
    this.closingBalance = shift.endBalanceAmount;
    this.status = shift.status;
    this.orderAmount = shift.totalVolume;
  }
}
