import { times } from 'lodash';
import { BookingDataTraveller as BookingDataTraveller } from './../../flights/models/price/booking-data-traveller.model';
import { PriceResultTravellers } from './../../flights/models/price/price-result-travellers.model';

export class BookingDataTravellers {
  public adults: BookingDataTraveller[];
  public children: BookingDataTraveller[];
  public infants: BookingDataTraveller[];
  public validation?: any;

  constructor(priceResultTravellers?: PriceResultTravellers) {
    // Initialise with empty arrays when instantiating for an empty store
    if (!priceResultTravellers) {
      this.adults = [];
      this.children = [];
      this.infants = [];

      return;
    }

    /**
     * Given a valid travellers object from the PriceRS, initialise each corresponding
     * PriceTraveller object
     */
    const { adults, children, infants } = priceResultTravellers;

    /**
     * Each traveller has a travellerCount (similar to their index, but +1)
     * This value is used in the UI, but also to order the traveller groups, ie.
     * `adults`, then `children`, then `infants`
     */
    let count = 0;
    this.adults = times(adults, () => new BookingDataTraveller('ADULT', ++count));
    this.children = times(children, () => new BookingDataTraveller('CHILD', ++count));
    this.infants = times(infants, () => new BookingDataTraveller('INFANT', ++count));
  }
}
