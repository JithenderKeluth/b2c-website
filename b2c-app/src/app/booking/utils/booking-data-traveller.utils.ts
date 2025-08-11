import { BookingDataTraveller } from './../../flights/models/price/booking-data-traveller.model';
//import { BookingDataTravellers } from 'price/booking-data-traveller.model';

export function getTravellerList(travellers: any): BookingDataTraveller[] {
  if (!travellers) {
    return [];
  }

  return [...travellers.adults, ...travellers.children, ...travellers.infants];
}

export function getNonInfantTravellerList(travellers: any): BookingDataTraveller[] {
  if (!travellers) {
    return [];
  }

  return [...travellers.adults, ...travellers.children, ...travellers.infants];
}

export function getTravellerDisplayName(traveller: BookingDataTraveller): string {
  if (!traveller.firstName || !traveller.lastName) {
    return 'Traveller';
  }

  return `${traveller.firstName} ${traveller.lastName}`;
}

/**excluding the prefix airlinecode and special characters from frequent flyer code */
export function getFrequentFlyerCode(frequentFlyerCode: string, airlineCode: string): string {
  if (frequentFlyerCode.startsWith(airlineCode)) {
    frequentFlyerCode = frequentFlyerCode.slice(airlineCode.length);
  }
  // Remove special characters
  frequentFlyerCode = frequentFlyerCode.replace(/[^a-zA-Z0-9]/g, '');
  return frequentFlyerCode;
}
