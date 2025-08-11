import { Fare } from './fare.model';

/**
* Discount data as returned by the SLX discount API.
* This is injected onto the Travelstart search results.
*/
export interface DiscountResponseModel {
  sFeeDiscount?: number;
  sfeeDiscountBreakdown?: {
    name: string,
    amount: number,
    percentage: number,
  }[];
}

export interface FareBreakdown extends DiscountResponseModel {
  adults: Fare;
  children: Fare;
  infants: Fare;
  youngAdults: Fare;
  taxAmount: number;
  invoiceLines: any;
  totalOutstanding: number;
  totalPaid: number;
  discountAmount:number;
}
