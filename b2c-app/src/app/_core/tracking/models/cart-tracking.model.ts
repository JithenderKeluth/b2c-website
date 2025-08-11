export interface MainCart {
  currency: string;
  country: string;
  language: string;
  tripType: string;
  airlineName: string;
  route: string;
  sector: string;
  cityPair: string;
  originAirportCode: string;
  destinationAirportCode: string;
  departureDate: string;
  destinationIATA: string;
  destinationCityName: string;
  originIATA: string;
  originCityName: string;
  returnDate: string;
  numberAdults: number;
  numberChildren: number;
  numberInfants: number;
  paxTotal: number;
  flightPrice: number;
  taxAmount: number;
  transactionTotal: number;
}

export interface TravellerCart {
  title: string;
  firstName: string;
  lastName: string;
  traveller: any[];
  email: string;
  phone: string;
  dob: any;
}

export interface PaymentCart {
  currencyCode: string;
  cardType: string;
  bankId: string;
  accountNo: string;
  iban: string;
  method: string;
  name: string;
  paymentMethodName: string;
  paymentOptionName: string;
  products: any[];
  bookingReference: string;
  coupon: string;
}
