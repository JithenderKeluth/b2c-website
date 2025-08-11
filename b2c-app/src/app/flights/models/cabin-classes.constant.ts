import { CabinClass } from './cabin-class.model';

// TODO: Move to 'constants'
export const CABIN_CLASSES = {
  business: new CabinClass('Business', 'BUSINESS'),
  economy: new CabinClass('Economy', 'ECONOMY'),
  first: new CabinClass('First', 'FIRST'),
  premium: new CabinClass('Premium', 'PREMIUM'),
};
