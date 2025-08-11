import { Travellers } from './../../models/travellers';
import { MoreOptions } from './../../models/more-options.model';
import { TRIP_TYPES } from './../trip-types';
import { SearchItinerary } from './search-itinerary.model';
// import { Type } from 'serializer.ts/Decorators';

export class SearchData {
  public tripType: string;
  public isNewSession: boolean;
  // @Type(() => Travellers)
  public travellers: Travellers;
  // @Type(() => MoreOptions)
  public moreOptions: MoreOptions;
  public outboundFlightNumber: string;
  public inboundFlightNumber: string;

  // @Type(() => SearchItinerary)
  public itineraries: SearchItinerary[];
  public locale: any;
  public loyaltyData: any;
  public searchIdentifier: string;

  public country: any;
  /**
   * For backwards compatibility, keep previous default values
   */
  public constructor() {
    this.tripType = TRIP_TYPES.return;
    this.isNewSession = true;
    this.travellers = new Travellers();
    this.moreOptions = new MoreOptions();
    this.outboundFlightNumber = '';
    this.inboundFlightNumber = '';
    this.itineraries = [new SearchItinerary(), new SearchItinerary()];
    this.searchIdentifier = '';
    this.country = '';
  }
}
