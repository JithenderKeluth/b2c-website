export interface BinListResponse {
  bank?: any; // {}
  scheme?: "visa" | string; // visa
  number?: {
    length: number; // 16
    luhn?: boolean; // true
  };
  bin: string; // 424242
  prepaid?: "True" | "False"; // False
  brand?: string; // Traditional
  country?: {
    alpha2: string; // US
    name: string; // United States of America
    numeric: string; // 840
    currency: string; // USD
  };
  type?: "credit" | "debit" | string;
}

/**Here it is cheking the validation results from the API and returns corresponding error messages*/
export function paymentValidations(bookingDetails: any, appSessionService: any) {
  let errorObj: any;
  let msg: string = '';
  let img: string = '';
  errorObj = {
    msg: msg,
    img: img,
  };

  if (bookingDetails.validationResults.paymentDetailsValidationResults.invalidFields.expirationDateValid == false) {
    errorObj.msg = '';
    errorObj.img = '';
    errorObj.msg = 'Oops, your card is expired. Please use a different card.';
    errorObj.img = `assets/icons/Icon/Negative-scenarios/card_expired_icon.svg`;
    return errorObj;
  }

  if (bookingDetails.validationResults.paymentDetailsValidationResults.invalidFields.cardNumberValid == false) {
    errorObj.msg = '';
    errorObj.img = '';
    errorObj.msg = 'Your card type is not supported. Please use a different card.';
    errorObj.img = appSessionService.isWhiteLabelInstance()
      ? `/assets/icons/Icon/Negative-scenarios/booking_failed_icon.svg`
      : `/assets/icons/Icon/Negative-scenarios/incorrect_card_icon.svg`;
    return errorObj;
  }

  if (bookingDetails.threeDSecureParameters && bookingDetails.threeDSecureParameters.length > 0) {
    errorObj.msg = '';
    errorObj.img = '';
    errorObj.msg = 'There was an issue processing your payment. Please try again.';
    errorObj.img = `/assets/icons/Icon/Negative-scenarios/trouble_payment_icon.svg`;
    return errorObj;
  }

  if (bookingDetails.validationResults.paymentDetailsValidationResults.invalidFields.cvvValid === false) {
    errorObj.msg = '';
    errorObj.img = '';
    errorObj.msg = 'Invalid CVV';
    errorObj.img = `/assets/icons/Icon/Negative-scenarios/booking_failed_icon.svg`;
    return errorObj;
  }
}

/**Here it is to load the car widget in booking confirmation page */
export function meiliTripInfo(itinDetails: any) {
  let bookingInformation:any;
  if (typeof window !== 'undefined' && window.sessionStorage) {
    bookingInformation = JSON.parse(sessionStorage.getItem('bookingDetails'));
  }
  let tripInfo: any;
  let tripInfo_1: any;
  let tripInfo_2: any;
  if (bookingInformation.bookingInformation.tripType !== 'return') {
    tripInfo_1 = getTripInfo(itinDetails[0].odoList[0].segments[0], false);
    if(itinDetails[0].odoList[0].segments.length == 1){
      tripInfo_2 = getTripInfo(itinDetails[0].odoList[0].segments[0], true)
    }else{
      tripInfo_2 = getTripInfo(
        itinDetails[0].odoList[itinDetails[0].odoList.length - 1].segments[
          itinDetails[0].odoList[itinDetails[0].odoList.length - 1].segments.length - 1
        ],
        false
      );
    }
    tripInfo = [tripInfo_1, tripInfo_2];
  } else {
    if (itinDetails.length === 1) {
      tripInfo_1 = getReturnTripInfo(
        itinDetails[0].odoList[0].segments[itinDetails[0].odoList[0].segments.length - 1],
        itinDetails[0].odoList[itinDetails[0].odoList.length - 1].segments[0]
      );
    } else if (itinDetails.length === 2) {
      tripInfo_1 = getReturnTripInfo(
        itinDetails[0].odoList[0].segments[itinDetails[0].odoList[0].segments.length - 1],
        itinDetails[itinDetails.length - 1].odoList[0].segments[0]
      );
    }

    tripInfo = [tripInfo_1];
  }
  return tripInfo;
}

export function getTripInfo(segment: any, isSeg1: boolean) {
  return {
    pickupLocation: {
      iataCode: isSeg1 ? segment.destCode : segment.origCode,
    },
    dropoffLocation: {
      iataCode: isSeg1 ? segment.destCode : segment.origCode,
    },
    pickupDate: getFormattedDate(segment.departureDateTime),
    pickupTime: getFormattedTime(segment.departureDateTime),
    dropoffDate: getFormattedDate(segment.arrivalDateTime),
    dropoffTime: getFormattedTime(segment.arrivalDateTime),
    driverAge: 30,
    countryCode: 'ZA',
  };
}
export function getReturnTripInfo(seg1: any, seg2: any) {
  return {
    pickupLocation: {
      iataCode: seg1.destCode,
    },
    dropoffLocation: {
      iataCode: seg2.origCode,
    },
    pickupDate: getFormattedDate(seg1.arrivalDateTime),
    pickupTime: getFormattedTime(seg1.arrivalDateTime),
    dropoffDate: getFormattedDate(seg2.departureDateTime),
    dropoffTime: getFormattedTime(seg2.departureDateTime),
    driverAge: 30,
    countryCode: 'ZA',
  };
}
/**It returns the formatted date based on passed date */
export function getFormattedDate(reqDate: string) {
  const datetimeString = reqDate;
  const date = new Date(datetimeString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
}
/**It returns the formatted time based on passed date */
export function getFormattedTime(reqTime: string) {
  const datetimeString = reqTime;
  const date = new Date(datetimeString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const formattedTime = `${hours}:${minutes}`;
  return formattedTime;
}

/**It returns the booking reference */
export function getBookRef(){
  let bookingRef: string;
  if (typeof window !== 'undefined' && window.sessionStorage) {
    if (sessionStorage.getItem('paymentMethods')) {
      bookingRef = JSON.parse(sessionStorage.getItem('paymentMethods')).tccReference;
      return bookingRef;
    }
  }
}

/**checking the processing with products*/
export function checkPaymentTypeFee(data: any ,cardNumber? :any) {
  let paymentTypeFeeData = {
    discountAmount: 0,
    processingFee: 0,
    showDiscount: false,
  };
  if (data && data.constructor !== Array) {
    paymentTypeFeeData.processingFee = data;
    paymentTypeFeeData.showDiscount = false;
    paymentTypeFeeData.discountAmount = 0;
    return paymentTypeFeeData;
  } else if (data && data.constructor == Array) {
    paymentTypeFeeData = paymentProducts(data,cardNumber);
  }
  return paymentTypeFeeData;
}
export function paymentProducts(products: any,cardNumber?:any) {
  let procAmount = {
    discountAmount: 0,
    processingFee: 0,
    showDiscount: false,
  };
  products.forEach((z: any) => {
    if (z?.id == 'CARD_BIN_DISCOUNT_PRODUCT' && checkCardBinDiscountNumbers(z,cardNumber)  ) {
      procAmount.showDiscount = true;
      procAmount.discountAmount = z.amount;
    } else if(z.id != 'CARD_BIN_DISCOUNT_PRODUCT') {
      procAmount.processingFee = z.amount;
      procAmount.showDiscount = false;
    }
  });
  return procAmount;
}
export function getNegtiveAmount(amount:any){
      return Math.abs(amount);
}
/**To check enter card number is exist or not in discount product cardBinDiscountNumbers  */
 function checkCardBinDiscountNumbers(data:any,cardNumber:number){
   return Boolean(cardNumber && data?.cardBinDiscountNumbers?.length > 0 && data?.cardBinDiscountNumbers?.some((x:any)=>x == cardNumber));
}
/**To change the text related to voucher  */
export function modifyProduct_Desc(productDescription:any){
  if (productDescription.includes('Voucher')) {
    return productDescription.replace(productDescription ,'Voucher')
  } else {
    return productDescription;
  }
}
/**here we are constructing the common data for payment events  */
export function getEventsSharedData(){
  if (typeof window !== 'undefined' && window.sessionStorage) {
    const bookingInfo = JSON.parse(sessionStorage.getItem('bookingInfo'));
    const itinResponse = bookingInfo.itineraryData;
    const flightResultsData = JSON.parse(sessionStorage.getItem('flightResults'));
    const searchInfoData = JSON.parse(sessionStorage.getItem('flightsearchInfo'));
    const additionalDataInfo = {
      contactInfo: bookingInfo?.contactDetails,
      travellerInfo: bookingInfo?.travellerDetails?.travellersList,
      addonsInfo: JSON.parse(sessionStorage.getItem('products')),
      baggageData : JSON.parse(sessionStorage.getItem('baggageInfo')),
    };
      return {itinResponse,flightResultsData,searchInfoData,additionalDataInfo}
  }
}




