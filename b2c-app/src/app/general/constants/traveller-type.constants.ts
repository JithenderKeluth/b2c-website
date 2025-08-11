/**
 *  Traveller Constants
 */

// NG1 constant.PASSENGER
export const TRAVELLER_TYPE = {
  ADULT: { type: 'ADULT', ageMaxExclusive: 110, code: 10, display: 'Adult' },
  YOUNGADULT: { type: 'YOUNGADULT', ageMaxExclusive: 15, code: 10, display: 'Young Adult' },
  CHILD: { type: 'CHILD', ageMaxExclusive: 12, code: 8, display: 'Child' },
  INFANT: { type: 'INFANT', ageMaxExclusive: 2, code: 7, display: 'Infant' },
};

/**
 * more like enum -> so you can do this
 * if you remove any of these cases, the function won't compile
 * because it can't guarantee that you've returned a string
 *
 * export function order1(p: TRAVELLER_TYPE): string {
 *    switch (p) {
 *        case TRAVELLER_TYPE.ADULT.type: return 'just for show';
 *        case TRAVELLER_TYPE.CHILD.type: return 'just for show';
 *        case TRAVELLER_TYPE.INFANT.type: return 'just for show';
 *    }
 * }
 */
export type TRAVELLER_TYPE = keyof typeof TRAVELLER_TYPE;
