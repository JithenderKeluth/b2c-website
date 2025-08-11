import * as LZString from 'lz-string';

declare global {
  interface Window {
    dataLayer: any[];
  }
}

const COMPRESSED_MARKER = '__compressed__';

/**
 * Utility to check if running in a browser (avoids SSR issues).
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined';
}

function setStorageData(key: string, value: any): void {
  if (!isBrowser()) return;

  const initialValue = value;
  try {
    sessionStorage.setItem(key, initialValue);
  } catch (e: any) {
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      console.warn('Session storage quota exceeded, attempting to free up space...');
      sendQuotaExceededError(key, 'QuotaExceededError, attempting to free up space...');

      const compressedValue = COMPRESSED_MARKER + LZString.compress(initialValue);
      try {
        sessionStorage.setItem(key, compressedValue);
        sendQuotaExceededError(key, 'QuotaExceededError is successfully parsed.');
      } catch (compressionError) {
        console.error('Failed to set item even after compression:', compressionError);
        sendQuotaExceededError(key, 'Failed to set item even after compression.');
      }
    } else {
      console.error('Failed to set item in session storage:', e);
      sendQuotaExceededError(key, 'Failed to set item in session.');
    }
  }
}

function getStorageData(key: string): any {
  if (!isBrowser()) return null;

  const item = sessionStorage.getItem(key);
  if (item) {
    try {
      if (item.startsWith(COMPRESSED_MARKER)) {
        const decompressedItem = LZString.decompress(item.substring(COMPRESSED_MARKER.length));
        return decompressedItem;
      }
      return item;
    } catch (e) {
      console.error('Failed to parse or decompress item from session storage:', e);
      sendQuotaExceededError(key, 'Failed to parse or decompress item from session storage.');
      return null;
    }
  }
  return null;
}

function removeStorageData(key: string): void {
  if (!isBrowser()) return;
  sessionStorage.removeItem(key);
}

function clearAllSessionStorageData(): void {
  if (!isBrowser()) return;

  const itemsToClear = [
    'bookingDetails',
    'paymentMethods',
    'priceData',
    'selectedFlight',
    'paymentReqInfo',
    'bookingInfo',
    'standardAmount',
    'selectedPrice',
    'selectTab',
    'bookAPIRequestData',
    'selectedPayment',
    'baggageInfo',
    'showInitAddons',
    'products',
    'useTravlellers',
    'redirectGateWayResponse',
    'selectedDomesticFlight',
    'travellerFormData',
    'paxDetails',
    'booking_Countdown',
    'contactInfo',
    'travellerDetails',
    'bookingSummaryAmt',
    'travellerPageproducts',
    'travellerPagequeryStringParams',
    'selectedHotelInfo'
  ];

  removeStorageData('flightResults');
  itemsToClear.forEach((item) => sessionStorage.removeItem(item));
}

function sendQuotaExceededError(key: any, value: any): void {
  pingGTM({
    event: 'QuotaExceededError',
    key: key,
    message: value,
  });
}

function pingGTM(obj: any): void {
  if (isBrowser() && obj && window.dataLayer) {
    window.dataLayer.push(obj);
  }
}

export {
  setStorageData,
  getStorageData,
  removeStorageData,
  clearAllSessionStorageData
};
