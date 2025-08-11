import { assign } from 'lodash';

const defaultValues = {
  airport: '',
  city: '',
  code: '',
  country: '',
  countryIata: '',
  iata: '',
  locationId: '',
  type: '',
};

export class Location {
  public airport: string;
  public city: string;
  public code: string;
  public country: string;
  public countryIata: string;
  public iata: string;
  public locationId: string;
  public type: string;

  constructor(newLocation?: any) {
    assign(this, defaultValues, newLocation);
  }

  public getDisplay(): string {
    // Return a falsy string if the required values don't exist
    return this.city && this.airport ? `${this.city} ${this.airport}` : '';
  }
}
