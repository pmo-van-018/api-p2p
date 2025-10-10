import { Shift } from '@api/shift/models/Shift';
import { BaseShiftResponse } from '@api/shift/responses/BaseShiftResponse';

export class ShiftResponse extends BaseShiftResponse {
  public readonly walletAddress: string;
  public readonly nickName: string;

  constructor(shift: Shift) {
    super(shift);
    this.walletAddress = shift.operation.walletAddress;
    this.nickName = shift.operation.nickName;
  }
}
