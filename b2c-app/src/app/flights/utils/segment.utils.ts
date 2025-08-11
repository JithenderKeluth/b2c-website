import moment from 'moment';
import { includes, isEmpty, isNil, keys, pickBy, round, some } from 'lodash';

import { Segment } from './../models/results/segment.model';
import { SearchResultsItinerary } from './../models/results/search-results-itinerary.model';
import { Odo } from './../models/results/odo.model';
import { odoSome } from './odo.utils';

function getBaggageAllowance(
  baggageAllowanceMap: { [baggageAllowanceDescription: string]: number[] },
  segment: Segment
): string[] {
  if (isEmpty(baggageAllowanceMap) || !segment || isNil(segment.ID)) {
    return [];
  }

  return keys(pickBy(baggageAllowanceMap, (segmentIds: number[]) => includes(segmentIds, segment.ID)));
}

function getTotalDurationDays(segment: Segment): number {
  if (!segment || !segment.arrivalDateTime || !segment.departureDateTime) {
    return 0;
  }

  const arrivalDay = moment.utc(segment.arrivalDateTime).startOf('day');
  const departureDay = moment.utc(segment.departureDateTime).startOf('day');

  return round(arrivalDay.diff(departureDay, 'days', true));
}

function isLongLayover(firstSegment: Segment, secondSegment: Segment, longLayoverDuration: number): boolean {
  if (!firstSegment || !secondSegment || !longLayoverDuration) {
    return false;
  }

  const arrivalMoment = moment(firstSegment.arrivalDateTime);
  const departureMoment = moment(secondSegment.departureDateTime);

  const layoverDuration = departureMoment.diff(arrivalMoment) / (60 * 60 * 1000);

  return layoverDuration > longLayoverDuration;
}

function isOvernightFlight(segment: Segment, overnightFlightDuration: number): boolean {
  if (!segment || !overnightFlightDuration) {
    return false;
  }

  const arrivalMoment = moment(segment.arrivalDateTime);
  const departureMoment = moment(segment.departureDateTime);
  const departureHour = departureMoment.hour();

  const flightDuration = arrivalMoment.diff(departureMoment) / (60 * 60 * 1000);

  return flightDuration > overnightFlightDuration && departureHour >= 24 - flightDuration;
}

function segmentSome(itineraries: SearchResultsItinerary[], func: (segment: Segment) => boolean): boolean {
  return odoSome(itineraries, (odo: Odo) => {
    return some(odo.segments, (segment: Segment) => func(segment));
  });
}

function  getAirline(odoList:any){
  for (let segment in odoList?.segments) {
    return odoList.segments[segment]?.validatingCarrierCode ? odoList.segments[segment].validatingCarrierCode : odoList.segments[0].airlineCode;
  }
}

export { getBaggageAllowance, getTotalDurationDays, isLongLayover, isOvernightFlight, segmentSome, getAirline };
