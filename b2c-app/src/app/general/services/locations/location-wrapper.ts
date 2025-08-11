import { Type } from 'serializer.ts/Decorators';

import { Location } from './location.model';

/**
 * API expects wrapped locations with display field
 */
export class LocationWrapper {
  public display: string;
  @Type(() => Location)
  public value: Location;

  public constructor(location?: Location) {
    this.value = location || new Location({});
    if (this.value) {
      this.display = this.value.getDisplay();
    }
    // TODO: wtf... find out why it has to be done this way
    this.isBlank = this.isBlank.bind(this);
  }

  public isBlank(): boolean {
    return (
      this.value.airport === '' &&
      this.value.city === '' &&
      this.value.code === '' &&
      this.value.country === '' &&
      this.value.countryIata === '' &&
      this.value.iata === '' &&
      this.value.locationId === '' &&
      this.value.type === ''
    );
  }
}
