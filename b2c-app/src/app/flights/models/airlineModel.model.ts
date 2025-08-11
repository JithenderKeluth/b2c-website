export class AirlineModel {
  public id: number;
  public amount: number;
  public isChecked: boolean = false;
  public airlineCode: any;
  public airlineName: any;
  public currencycode: any;
  public flightsCount: number;
  public stops: number;
  public constructor(
    id?: number,
    amount?: number,
    isChecked?: boolean,
    airlineCode?: string,
    airlineName?: string,
    currencycode?: string,
    flightsCount?: number,
    stops?: number
  ) {
    this.id = id;
    this.amount = amount;
    this.isChecked = isChecked;
    this.airlineCode = airlineCode;
    this.airlineName = airlineName;
    this.currencycode = currencycode;
    this.flightsCount = flightsCount;
    this.stops = stops;
  }
}
