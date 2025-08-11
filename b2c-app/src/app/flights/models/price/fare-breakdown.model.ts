import { Fare } from './fare.model';

export interface FareBreakdown {
  adults: Fare;
  children: Fare;
  infants: Fare;
  taxAmount: number;
  invoiceLines: any;
  totalOutstanding: number;
  totalPaid: number;
}
