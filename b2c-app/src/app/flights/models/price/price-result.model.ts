import { Baggage } from './baggage.model';
import { ApiEncryptedData } from '../api-encrypted-data.model';
import { FareBreakdown } from './fare-breakdown.model';
import { SearchResultsItinerary } from '../results/search-results-itinerary.model';
import { SeatsMarkup } from './seats-markup.model';
import { ApiError } from '../api-error.model';
import { PriceResultTravellers } from './price-result-travellers.model';
import { SpecialServicesAllItineraries } from './special-services-all-itineraries.model';
import { TravellerSettings } from './traveller-settings.model';
import { PriceResultProduct } from './price-result-product.model';
import { BookingDataTraveller } from './booking-data-traveller.model';

export interface PriceResult {
  additionalErrorResponse: string;
  hasBaggageBeenIncluded?: boolean;
  isBaggageIncluded?: boolean;
  currencyCode: string;
  isLoyaltyDiscount: boolean;
  loyaltyDiscount: boolean;
  isVoucherInputEnabled: boolean;
  voucherInputEnabled: boolean;
  priceIncrease: number;
  selectedInboundItineraryId?: number;
  selectedOutboundItineraryId?: number;
  specialServicesAllItins?: SpecialServicesAllItineraries;
  totalAmount: number;
  travellerCount: number;
  baggageOptions: {
    allBaggage: Baggage[];
    baggagePerItinerary: Baggage[];
    baggagePerPassenger: Baggage[];
  };
  indexedBaggageOptions?: {
    [baggageOptionId: number]: Baggage;
  };
  indexedProducts?: {
    [productId: string]: PriceResultProduct;
  };
  data: ApiEncryptedData;
  errors: ApiError[];
  fareBreakdown: FareBreakdown;
  itineraries: SearchResultsItinerary[];
  products: PriceResultProduct[];
  markupRule: any;
  seatsMarkup?: SeatsMarkup;
  travellers: PriceResultTravellers;
  passengerSettings?: {
    adultSettings: TravellerSettings;
    childSettings: TravellerSettings;
    infantSettings: TravellerSettings;
  };
  paymentLinkType?: string;
  middleNameWarningAirportCode: string;
  passengers: BookingDataTraveller;
  showFqtv: boolean;
  airlineNames: any;
}
