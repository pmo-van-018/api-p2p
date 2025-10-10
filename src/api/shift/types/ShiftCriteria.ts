import { FilterDateType, SearchTextType } from '@api/shift/enums/ShiftEnum';
import { ShiftStatus } from '@api/shift/models/Shift';

export class ShiftCriteria {
  public shiftId?: string;
  public status?: ShiftStatus = ShiftStatus.FINISHED;
  public search?: string;
  public searchTextType?: SearchTextType;
  public startDate?: string;
  public endDate?: string;
  public filterDateType?: FilterDateType;
}
