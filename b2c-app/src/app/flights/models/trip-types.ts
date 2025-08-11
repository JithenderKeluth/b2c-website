export const TRIP_TYPES = {
  multiCity: 'multi',
  oneWay: 'oneway',
  return: 'return',
  multi_City: 'multicity',
};

export const getTripTypeEnums = (tripType: string) => {
  if (!tripType) return;
  switch (tripType) {
    case TRIP_TYPES.oneWay:
      return 1;
    case TRIP_TYPES.return:
      return 2;
    case TRIP_TYPES.multiCity:
      return 3;
    case TRIP_TYPES.multi_City:
      return 3;
    default:
      return '';
  }
};
