// get the city name based on the code
function getCurrencycode(currencyCode: string): string {
  switch (currencyCode) {
    case 'ZAR': {
      return 'R';
    }
    case 'NAD': {
      return 'N$';
    }

    default: {
      return 'R';
    }
  }
}
