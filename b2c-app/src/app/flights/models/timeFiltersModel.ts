export class TimeFiltersModel {
  public deptCity: string;
  public arrCity: string;
  public isChecked: boolean = false;
  public deptTimeLow: any;
  public deptTimeHigh: any;
  public isDeptTimeFilter: boolean;
  public isArrivalTimeFilter: boolean;
  public constructor(
    deptCity?: string,
    arrCity?: string,
    isChecked?: boolean,
    deptTimeLow?: any,
    deptTimeHigh?: string,
    isDeptTimeFilter?: boolean,
    isArrivalTimeFilter?: boolean
  ) {
    this.deptCity = deptCity;
    this.arrCity = arrCity;
    this.isChecked = isChecked;
    this.deptTimeLow = deptTimeLow;
    this.deptTimeHigh = deptTimeHigh;
    this.isDeptTimeFilter = isDeptTimeFilter;
    this.isArrivalTimeFilter = isArrivalTimeFilter;
  }
}
