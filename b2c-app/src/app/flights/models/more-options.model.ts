// import { Type } from 'serializer.ts/Decorators';

import { CabinClass } from './../models/cabin-class.model';
import { CABIN_CLASSES } from './cabin-classes.constant';
import { PreferredAirline } from './../models/airline.model';

export class MoreOptions {
  // @Type(() => CabinClass)
  public preferredCabins: CabinClass;
  public preferredAirlines: PreferredAirline;
  public isCalendarSearch: boolean;

  constructor(preferredCabins?: CabinClass, isCalendarSearch?: boolean) {
    this.preferredCabins = preferredCabins || CABIN_CLASSES.economy;
    this.isCalendarSearch = isCalendarSearch || false;
  }
}
