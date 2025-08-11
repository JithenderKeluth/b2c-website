export function updateProducts(productId: string, isSelected: boolean) {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    let products = sessionStorage.getItem('products') ? JSON.parse(sessionStorage.getItem('products')) : null;
    if (products) {
      products.forEach((x: any) => {
        if (x.id == productId) {
          x.initSelected = isSelected;
        }
      });
      sessionStorage.setItem('products', JSON.stringify(products));
    }
  }
}
export function isCheckedbaggageAvl(priceData: any) {
  /*
   *checks if the flights has checked baggage
   */
  if (priceData && priceData.itineraries) {
    for (let i = 0; i < priceData.itineraries.length; i++) {
      if (!priceData.itineraries[i].hasCheckedBagsForAllSegments) {
        if (priceData.itineraries[i]?.specialServiceAttributes?.offerPriceWithIncludedBaggage) {
          if (priceData.itineraries[i].odoList[0].segments[0].baggageAllowance.length > 0) {
            return true;
          }
        }
      }
    }
  }
  return false;
}
/**To baggale enable Itinerary */
export function baggageItin(priceData: any) {
  /*
   *checks if the flights has checked baggage
   */
  let baggageItin: any = [];
  if (priceData && priceData.itineraries) {
    for (let i = 0; i < priceData.itineraries.length; i++) {
      if (!priceData.itineraries[i].hasCheckedBagsForAllSegments) {
        if (
          priceData.itineraries[i].specialServiceAttributes &&
          priceData.itineraries[i].specialServiceAttributes.offerPriceWithIncludedBaggage
        ) {
          baggageItin.push(priceData.itineraries[i]);
        }
      }
    }
  }
  return baggageItin;
}
export function baggageDesc(bag: any) {
  if (bag.includes('hand baggage')) {
    return bag.slice(0, bag.indexOf('hand baggage'));
  } else {
    return bag;
  }
}
export function isHandBag(bag: any) {
  if (bag.includes('hand baggage')) {
    return true;
  } else {
    return false;
  }
}
export function bagageDescLabel(bag: any) {
  if (bag.includes('hand baggage') && bag !== 'No baggage allowance') {
    return 'Hand baggage';
  } else if (bag !== 'No baggage allowance') {
    return 'Checked baggage';
  } else if (bag == 'No baggage allowance') {
    return 'No baggage';
  }
}
/**To get quantity of checked baggage when user select the checked baggage */
export function getCheckedBaggageValue(priceData: any) {
  if(priceData?.itineraries?.length > 0) {
    for (let i = 0; i < priceData.itineraries.length; i++) {
      if (priceData.itineraries[i]?.specialServiceAttributes?.offerPriceWithIncludedBaggage && priceData.itineraries[i].odoList[0].segments[0]?.baggageAllowance?.length > 0) {
        for (let k = 0; k < priceData.itineraries[i].odoList[0].segments[0].baggageAllowance.length; k++) {
          if (!isHandBag(priceData.itineraries[i].odoList[0].segments[0].baggageAllowance[k]) &&
            priceData.itineraries[i].odoList[0].segments[0].baggageAllowance[k] !== 'No baggage allowance') {
            return priceData.itineraries[i].odoList[0].segments[0].baggageAllowance[k];
          }
        }
      }
    }
  }
}
