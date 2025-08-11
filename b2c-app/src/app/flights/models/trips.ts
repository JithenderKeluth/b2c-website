export class Trips {
  name: string;
  value: string;
}

export const TripType: Trips[] = [
  {
    name: 'Return',
    value: 'return',
  },
  {
    name: 'One-way',
    value: 'oneway',
  },

  {
    name: 'Multi-city',
    value: 'multi',
  },
];
