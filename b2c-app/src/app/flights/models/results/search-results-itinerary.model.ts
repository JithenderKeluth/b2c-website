import { Odo } from './odo.model';
import { FareBreakdown } from './../../models/price/fare-breakdown.model';
import { SpecialServiceAttributes } from '../special-service-attributes.model';

export interface SearchResultsItinerary {
  readonly id: number;
  readonly amount: number;
  readonly currencyCode: string;
  readonly decimalPlaces: number;
  readonly ppsAmount: number;
  readonly odoList: Odo[];
  // Only available in Search response
  readonly fareBreakdown: FareBreakdown;
  // Only available in Price response
  readonly specialServiceAttributes: SpecialServiceAttributes;

  isAvailable?: boolean;
  isInBusinessPolicy?: boolean;
  isPinned?: boolean;
  hasCheckedBagsForAllSegments?: boolean;
  // populated early to avoid dom list element re-render
  promoInfo?: string;
  /**for B2B markup & discount */
  additionalMarkup?: number;
  dynamicDiscount?: number;
}
