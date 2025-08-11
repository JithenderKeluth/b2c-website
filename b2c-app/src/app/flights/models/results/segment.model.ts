/**
 * FIXME: The following properties need to be changed in order to conform with naming standards
 *
 * ID -> id
 * opAirlinCode -> operatingAirlineCode
 * destCode -> destinationIata
 * origCode -> originIata
 *
 * This would need to be done in conjunction with updating the classes in the web-api. A suggestion
 * would be to write a custom deserializer that converts the JSON reponse into this model with the
 * updated property names while maintaining backwards compatibility with the old property names.
 * After that, the web-api classes could be safely updated (or just left silly and we'll have nice
 * naming standards in angular)
 */
export interface Segment {
  ID: number;
  airlineCode: string;
  arrivalDateTime: string;
  departureDateTime: string;
  // TODO: Check that this is acceptable when deserializing from a SearchRS/PriceRS
  cabinClass: 'ECONOMY' | 'BUSINESS' | 'FIRST' | 'PREMIUM';
  flightNumber: string;
  duration: number;
  technicalStops: number;
  // Only available in Price response. Baggage allowance in Search response is stored in a
  // separate map of { [baggageAllowanceDescription: string]: applicableSegmentIds: string[] }
  baggageAllowance: string[];
  fareBasisCode: string;
  bookingClass: string;
  opAirlineCode: string;
  destCode: string;
  origCode: string;
  displayRoute?: string;
}
