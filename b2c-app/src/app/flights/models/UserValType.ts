interface UserValType {
  stop: { [key: number]: boolean };
  airLine: Record<string, any>;
  departLow: number;
  departHigh: number;
  arriveLow: number;
  arriveHigh: number;
  cabinClass: Record<string, any>;
  priceLow: number;
  priceHigh: number;
  dptSelects: any; // Replace 'any' with the actual type of dptSelects
  checkedBaggage: boolean;
  noCheckedBaggage: boolean;
  handBaggage: boolean;
}

export function createUserVal(_minPrice: any, _maxPrice: any, dptSelect: any): UserValType {
  return {
    stop: { 0: false, 1: false, 2: false },
    airLine: {},
    departLow: 0,
    departHigh: 1440,
    arriveLow: 0,
    arriveHigh: 1440,
    cabinClass: {},
    priceLow: _minPrice,
    priceHigh: _maxPrice,
    dptSelects: dptSelect, // Replace 'any' with the actual type of dptSelect
    checkedBaggage: false,
    noCheckedBaggage: false,
    handBaggage: false,
  };
}
