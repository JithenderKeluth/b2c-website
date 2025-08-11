import moment from 'moment';
import { map, head, last } from 'lodash';
import {
  getCleanDataLayerObject,
  parseLocaleData,
  parseUserType,
  parseLoginData,
  parseSignupData,
  parseNewsletterSubscribeData,
  parseAffiliateId,
  parseViewFlightData,
  clearProductsData,
  parseCartTravellerData,
  parseSelectedSeatData,
  parseCartProductsData,
  parseConfirmationData,
  parseCorrelationId,
  parseAddToCartData,
  parseSearchData,
  parseTimingInfo,
  parseTransactionData,
  parseBookingReference,
  parseVoucherData,
  parseCartPaymentData,
  parseProductData,
  getFlightNumbersStringFromOdo,
  getAirlineNamesFromOdo,
  getTotalFromItineraries,
  getFlightNumbersString,
  getAdditionalFaresFromProducts,
  isWhatsappProductPresent,
  getProcessingFee,
  getItinOriginAirportCode,
  getItinDestinationAirportCode,
  formatDateforWE,
  getLanguage,
  getCountry,
  getCurrencyCode,
  getBirthDateFromUser,
  getBirthDateFromTraveller,
  getGenderFromUser,
  getFirstName,
  getLastName,
  getEmail,
  getPhoneNumber,
  getGenderFromTitle,
} from 'general/services/trackers/data-layer-parser.utils';
import { SEARCH_DATA_MOCK } from 'search/directives/new-search-form/models/search-data.model.mock';
import { USER_PROFILE_DETAILS_MOCK } from 'account/utils/user-profile-details-mock';
import { SearchResults } from 'search-results/search-results.model';
import { SEARCH_RESULTS_MOCK } from 'search-results/search-results-mocks/search-results.mock';
import { Odo } from 'search-results/odo.model';

const searchResultsMock: SearchResults = { ...SEARCH_RESULTS_MOCK.cptToLonBundled };
const itineraryMock = [searchResultsMock.itineraries[0]];
const tripType = 'return';

describe('[DataLayerParserUtils]', () => {
  it('should return a clean data layer object', () => {
    expect(getCleanDataLayerObject()).toEqual({
      affiliateId: undefined,
      airlineName: undefined,
      arrivalTime: undefined,
      birthDate: undefined,
      bookingReference: undefined,
      cabinClass: undefined,
      category: undefined,
      cityPair: undefined,
      country: undefined,
      countryCode: undefined,
      coupon: undefined,
      currencyCode: undefined,
      departureDate: undefined,
      departureTime: undefined,
      destinationCity: undefined,
      destinationCountry: undefined,
      destinationCountryIata: undefined,
      destinationIata: undefined,
      domain: undefined,
      ecommerce: undefined,
      email: undefined,
      firstName: undefined,
      flightNumbers: undefined,
      flightPrice: undefined,
      flightSelected: undefined,
      gender: undefined,
      itemsGoogleFlights: undefined,
      language: undefined,
      languageCode: undefined,
      lastName: undefined,
      locality: undefined,
      loginType: undefined,
      mtnCustomer: undefined,
      name: undefined,
      onwardAirlineNames: undefined,
      onwardDateWE: undefined,
      onwardStops: undefined,
      originCity: undefined,
      originCountry: undefined,
      originCountryIata: undefined,
      originIata: undefined,
      paymentMethod: undefined,
      phone: undefined,
      price: undefined,
      priceAfterDiscount: undefined,
      priceBeforeDiscount: undefined,
      quantity: undefined,
      returnAirlineNames: undefined,
      returnArrivalTime: undefined,
      returnDate: undefined,
      returnDateWE: undefined,
      returnDepartureTime: undefined,
      returnFlightSelected: undefined,
      returnStops: undefined,
      route: undefined,
      routeType: undefined,
      searchDateWE: undefined,
      sector: undefined,
      selectedDestinationIata: undefined,
      selectedOriginIata: undefined,
      selectedSeat: undefined,
      sessionId: undefined,
      signupType: undefined,
      sku: undefined,
      totalPrice: undefined,
      transactionId: undefined,
      transactionProducts: undefined,
      transactionTax: undefined,
      transactionTotal: undefined,
      travellerAdult: undefined,
      travellerChild: undefined,
      travellerCount: undefined,
      travellerInfant: undefined,
      userId: undefined,
      userType: undefined,
    });
  });

  it('should parse an affiliate ID', () => {
    expect(parseAffiliateId('123')).toEqual({ affiliateId: '123' });
  });

  it('should parse correlation ID', () => {
    expect(parseCorrelationId('321')).toEqual({ sessionId: '321' });
  });

  it('should parse locale data', () => {
    expect(parseLocaleData('en', 'ZA', { country: 'ZA', currentLocale: 'en', locales: [] })).toEqual({
      country: 'South Africa',
      countryCode: 'ZA',
      currencyCode: 'ZAR',
      domain: 'ZA',
      language: 'english',
      languageCode: 'en',
      locality: 'en-ZA',
    });
  });

  it('should parse user type', () => {
    expect(parseUserType('guest')).toEqual({
      userType: 'guest',
    });
  });

  it('should parse login data', () => {
    const birthDateMock = moment(getBirthDateFromUser(USER_PROFILE_DETAILS_MOCK)).format('YYYY-MM-DD');
    expect(parseLoginData(USER_PROFILE_DETAILS_MOCK)).toEqual({
      birthDate: birthDateMock,
      email: 'fred@travelstart.com',
      firstName: 'fred',
      gender: 'male',
      lastName: 'du plessis',
      loginType: 'google',
      phone: '+270643101594',
      userId: '3amKw3Ls6g0strOzq8Ig0sRJIR5o9crlXgMWsl5YrxrIDf6vtG7Qm8hTPaL5VtnY',
    });

    expect(parseLoginData(undefined)).toBeUndefined();
  });

  it('should parse signup data', () => {
    expect(parseSignupData(USER_PROFILE_DETAILS_MOCK)).toEqual({
      email: 'fred@travelstart.com',
      firstName: 'fred',
      lastName: 'du plessis',
      signupType: 'google',
      userId: '3amKw3Ls6g0strOzq8Ig0sRJIR5o9crlXgMWsl5YrxrIDf6vtG7Qm8hTPaL5VtnY',
    });

    expect(parseSignupData(undefined)).toBeUndefined();
  });

  it('should parse newsletter subscribe data', () => {
    const credentials = {
      email: 'fred@travelstart.com',
      name: 'Fred',
      campaignType: 'HP Footer',
      subscribeSignupType: 'TS',
    };
    expect(parseNewsletterSubscribeData(credentials)).toEqual({
      firstName: credentials.name,
      email: credentials.email,
      subscribeSignupType: credentials.subscribeSignupType,
      campaignType: credentials.campaignType,
    });

    expect(parseNewsletterSubscribeData(undefined)).toBeUndefined();
  });

  it('should parse search data', () => {
    let departDateMock = '2019-12-16';
    const departDateFormatted = formatDateforWE(departDateMock);
    let returnDateMock = '2019-12-31';
    const returnDateFormatted = formatDateforWE(returnDateMock);
    const today = moment().format();
    const searchDateFormatted = formatDateforWE(today);
    expect(parseSearchData(SEARCH_DATA_MOCK, 'ZA')).toEqual({
      cabinClass: 'BUSINESS',
      cityPair: 'Johannesburg-Cape Town',
      departureDate: departDateMock,
      destinationCity: 'Cape Town',
      destinationCountry: 'South Africa',
      destinationCountryIata: 'ZA',
      destinationIata: 'CPT',
      mtnCustomer: true,
      onwardDateWE: departDateFormatted,
      originCity: 'Johannesburg',
      originCountry: 'South Africa',
      originCountryIata: 'ZA',
      originIata: 'JNB',
      returnDate: returnDateMock,
      returnDateWE: returnDateFormatted,
      route: 'JNB-CPT',
      routeType: 'DOMESTIC',
      searchDateWE: searchDateFormatted,
      sector: 'JNB_CPT',
      travellerAdult: 3,
      travellerChild: 1,
      travellerCount: 5,
      travellerInfant: 1,
      tripType: 'RETURN',
    });

    expect(parseSearchData(undefined, undefined)).toBeUndefined();
    expect((departDateMock = undefined)).toBeUndefined();
    expect((returnDateMock = undefined)).toBeUndefined();
  });

  it('should parse timing info', () => {
    spyOn(Date, 'now').and.returnValue(150);

    expect(parseTimingInfo('searchResults', new Date(100))).toEqual({ searchResults: 50 });

    expect(parseTimingInfo('undefined', undefined)).toBeUndefined();
  });

  it('should parse parseViewFlightData', () => {
    const mockSearchDate = '2020-11-04T16:06:00';

    expect(parseViewFlightData(searchResultsMock.airlineNames, itineraryMock, tripType, mockSearchDate)).toEqual({
      airlineName: 'South African Airways',
      arrivalTime: formatDateforWE('2019-12-01T06:25:00'),
      category: 'flights',
      departureTime: formatDateforWE('2019-11-30T13:10:00'),
      flightSelected: 'SA2014, SA234',
      onwardAirlineNames: 'South African Airways, South African Airways',
      onwardDateWE: formatDateforWE('2019-11-30T13:10:00'),
      onwardStops: 1,
      returnAirlineNames: 'South African Airways, South African Airways',
      returnArrivalTime: formatDateforWE('2019-12-19T10:55:00'),
      returnDateWE: formatDateforWE('2019-12-18T18:05:00'),
      returnDepartureTime: formatDateforWE('2019-12-18T18:05:00'),
      returnFlightSelected: 'SA235, SA313',
      returnStops: 1,
      searchDateWE: formatDateforWE('2020-11-04T16:06:00'),
      transactionTotal: 53009,
    });

    expect(parseViewFlightData(undefined, undefined, undefined, undefined)).toBeUndefined();
  });

  it('should parse addToCart data', () => {
    const mainCartMock = {
      airlineName: 'British Airways',
      cityPair: 'Cape Town-New York City, NY',
      country: 'ZA',
      currency: 'ZAR',
      departureDate: '2020-10-28',
      destinationAirportCode: 'NYC',
      destinationCityName: 'New York City, NY',
      destinationIATA: 'NYC',
      flightPrice: 6790,
      language: 'en',
      numberAdults: 1,
      numberChildren: 0,
      numberInfants: 0,
      originAirportCode: 'CPT',
      originCityName: 'Cape Town',
      originIATA: 'CPT',
      paxTotal: 1,
      products: [
        {
          brand: 'British Airways',
          category: 'Flight',
          id: 'CPT-NYC',
          name: 'Cape Town-New York City, NY',
          price: 15318,
          quantity: 1,
          variant: '2020-10-28',
        },
      ],
      returnDate: '2020-11-03',
      route: 'CPT-NYC',
      sector: 'CPT_NYC',
      taxAmount: 8528,
      transactionTotal: 15318,
      tripType: 'return',
    };
    const itinerariesMock = [
      {
        amount: 15318,
        currencyCode: 'ZAR',
        odoList: [
          {
            segments: [
              {
                airlineCode: 'BA',
                arrivalDateTime: '2020-10-29T04:50:00',
                departureDateTime: '2020-10-28T18:45:00',
                destCode: 'LHR',
                flightNumber: 'BA58',
                origCode: 'CPT',
              },
              {
                airlineCode: 'BA',
                arrivalDateTime: '2020-10-29T08:15:00',
                departureDateTime: '2020-10-29T06:50:00',
                destCode: 'DUB',
                flightNumber: 'BA5949',
                origCode: 'LHR',
              },
              {
                airlineCode: 'BA',
                arrivalDateTime: '2020-10-29T15:35:00',
                departureDateTime: '2020-10-29T13:00:00',
                destCode: 'EWR',
                flightNumber: 'BA6133',
                origCode: 'DUB',
              },
            ],
          },
          {
            segments: [
              {
                airlineCode: 'IB',
                arrivalDateTime: '2020-11-04T09:35:00',
                departureDateTime: '2020-11-03T21:45:00',
                destCode: 'LHR',
                flightNumber: 'IB7352',
                origCode: 'JFK',
              },
              {
                airlineCode: 'IB',
                arrivalDateTime: '2020-11-05T11:30:00',
                departureDateTime: '2020-11-04T21:45:00',
                destCode: 'CPT',
                flightNumber: 'IB7321',
                origCode: 'LHR',
              },
            ],
          },
        ],
      },
    ];

    const selectedDestinationIataMock = getItinDestinationAirportCode(itinerariesMock);
    const selectedOriginIataMock = getItinOriginAirportCode(itinerariesMock);
    const flightNumbersMock = getFlightNumbersString(itinerariesMock);
    expect(parseAddToCartData(mainCartMock, itinerariesMock)).toEqual({
      airlineName: 'British Airways',
      cityPair: 'Cape Town-New York City, NY',
      countryCode: 'ZA',
      currencyCode: 'ZAR',
      departureDate: '2020-10-28',
      destinationAirportCode: 'NYC',
      destinationCity: 'New York City, NY',
      destinationIata: 'NYC',
      ecommerce: {
        add: {
          products: {
            brand: 'British Airways',
            category: 'Flight',
            id: 'CPT-NYC',
            name: 'Cape Town-New York City, NY',
            price: 15318,
            quantity: 1,
            variant: 'return',
          },
        },
        currencyCode: 'ZAR',
      },
      flightNumbers: flightNumbersMock,
      flightPrice: 6790,
      languageCode: 'en',
      originAirportCode: 'CPT',
      originCity: 'Cape Town',
      originIata: 'CPT',
      returnDate: '2020-11-03',
      route: 'CPT-NYC',
      sector: 'CPT_NYC',
      selectedDestinationIata: selectedDestinationIataMock,
      selectedOriginIata: selectedOriginIataMock,
      transactionTax: 8528,
      transactionTotal: 15318,
      travellerAdult: 1,
      travellerChild: 0,
      travellerCount: 1,
      travellerInfant: 0,
      tripType: 'return',
    });

    expect(parseAddToCartData(undefined, undefined)).toBeUndefined();
  });

  it('should parse cartTraveller data', () => {
    const cartTravellerMock = {
      baggageSelection: [],
      email: 'fred@travelstart.com',
      firstName: 'FRED',
      id: 'd3a73b6f-0363-4296-9fcd-2e9da45d0100',
      lastName: 'DUPLESSIS',
      passengerCount: 1,
      phone: '+27643101594',
      title: 'Mr',
      traveller: {
        dob: {
          day: 16,
          month: 6,
          year: 1988,
        },
        firstName: 'FRED',
        lastName: 'DUPLESSIS',
        title: 'Mr',
      },
      type: 'ADULT',
    };
    const birthDateMock = getBirthDateFromTraveller(cartTravellerMock.traveller);
    const genderMock = getGenderFromTitle(cartTravellerMock.title);

    expect(parseCartTravellerData(cartTravellerMock)).toEqual({
      birthDate: birthDateMock,
      email: 'fred@travelstart.com',
      firstName: 'fred',
      gender: genderMock,
      lastName: 'duplessis',
      phone: '+27643101594',
      title: 'mr',
    });

    expect(parseCartTravellerData(undefined)).toBeUndefined();
  });

  it('should parse selected seat info', () => {
    expect(parseSelectedSeatData('A19')).toEqual({
      selectedSeat: 'A19',
    });

    expect(parseSelectedSeatData(undefined)).toBeUndefined();
  });

  it('should clear cartProducts data', () => {
    expect(clearProductsData()).toEqual({
      cartProducts: undefined,
    });

    expect(parseSelectedSeatData(undefined)).toBeUndefined();
  });

  it('should parse cartProducts data', () => {
    const cartProductsMock = [
      {
        amount: 19,
        id: 'WHATSAPP',
        name: 'Booking details via SMS and Whatsapp',
      },
      {
        amount: 999,
        id: 'CNG_AST',
        name: 'Flexible Travel Dates',
      },
      {
        amount: 399,
        id: 'CNC_RFD',
        name: 'Medical Cancellation Refund',
      },
      {
        amount: 450,
        id: 'LOU_ACC',
        name: 'Lounge Access',
      },
    ];
    const totalAmount = 17175;
    const parsedProductsMock = map(cartProductsMock, (product) => parseProductData(product));
    const additionalFaresMock = getAdditionalFaresFromProducts(parsedProductsMock);
    const whatsappOptinMock = isWhatsappProductPresent(parsedProductsMock);

    expect(parseCartProductsData(cartProductsMock, totalAmount)).toEqual({
      additionalFares: additionalFaresMock,
      cartProducts: [
        {
          ...parsedProductsMock,
        },
      ],
      transactionTotal: totalAmount,
      whatsappOptin: whatsappOptinMock,
    });

    expect(parseCartProductsData(undefined, undefined)).toEqual({
      cartProducts: undefined,
      transactionTotal: undefined,
    });
  });

  it('should parse booking reference', () => {
    expect(parseBookingReference('ZA08059607')).toEqual({ bookingReference: 'ZA08059607' });
  });

  it('should parse voucher code', () => {
    expect(parseVoucherData(17175, 'MOCK-CAMPAIGN', -1000)).toEqual({
      coupon: 'MOCK-CAMPAIGN',
      priceAfterDiscount: 16175,
      priceBeforeDiscount: 17175,
    });
  });

  it('should parse cartPayment data with EFT details', () => {
    const cartPaymentMock = {
      accountNo: '62182487895',
      bankId: 'fnb',
      cardType: undefined,
      currencyCode: 'ZAR',
      iban: undefined,
      method: 'eft',
      name: 'First National Bank',
      paymentMethodName: undefined,
      paymentOptionName: 'EFT',
      products: {
        amount: 109,
        id: 'Clearance_fee_int',
        name: 'Processing Fee',
      },
    };
    const parsedProductsMock = map(cartPaymentMock.products, (product) => parseProductData(product));
    const processingFeeMock = getProcessingFee(parsedProductsMock);

    expect(parseCartPaymentData(cartPaymentMock)).toEqual({
      bankAccountNo: '62182487895',
      bankId: 'fnb',
      cardType: undefined,
      currencyCode: 'ZAR',
      iban: undefined,
      method: 'eft',
      paymentMethod: undefined,
      paymentName: 'First National Bank',
      paymentOptionName: 'EFT',
      processingFee: processingFeeMock,
    });

    expect(parseCartTravellerData(undefined)).toBeUndefined();
  });

  it('should parse transaction data', () => {
    expect(
      parseTransactionData({
        bookingInformation: { bookingReferenceNo: 'ZA00123' },
        fareBreakdown: {
          currencyCode: 'ZAR',
          taxesAndFees: 250.8,
          totalAmount: 1000,
        },
        itineraries: [
          {
            odoList: [
              {
                segments: [
                  {
                    origCode: 'CPT',
                    destCode: 'JNB',
                    flightNumber: 'AB123',
                    departureDateTime: '2019-10-11',
                    cabinClass: 'Economy',
                  },
                ],
              },
              {
                segments: [
                  {
                    origCode: 'JNB',
                    destCode: 'CPT',
                    flightNumber: 'CD456',
                    departureDateTime: '2019-10-11',
                    cabinClass: 'Economy',
                  },
                ],
              },
            ],
          },
        ],
        products: [
          {
            amount: 23,
            id: 'unique',
            name: 'thingy',
          },
        ],
      })
    ).toEqual({
      currencyCode: 'ZAR',
      itemsGoogleFlights: [
        {
          destination: 'JNB',
          flight_number: 'AB123',
          origin: 'CPT',
          start_date: '2019-10-11',
          travel_class: 'Economy',
        },
        {
          destination: 'CPT',
          flight_number: 'CD456',
          origin: 'JNB',
          start_date: '2019-10-11',
          travel_class: 'Economy',
        },
      ],
      priceAfterDiscount: 1000,
      transactionId: 'ZA00123',
      transactionProducts: [
        {
          name: 'CPT-JNB',
          price: 749,
          quantity: 1,
          sku: 'AB123,CD456',
        },
        {
          name: 'thingy',
          price: 23,
          quantity: 1,
          sku: 'unique',
        },
      ],
      transactionTax: 250.8,
      transactionTotal: 1000,
    });

    expect(parseTransactionData(undefined)).toBeUndefined();
  });

  it('should parse confirmation data', () => {
    expect(
      parseConfirmationData({
        bookingInformation: {
          bookingReferenceNo: '0987654321',
          selectedPaymentMethod: {
            paymentOptionName: 'creditCard',
          },
        },
      })
    ).toEqual({
      paymentMethod: 'creditCard',
      transactionId: '0987654321',
    });

    expect(parseConfirmationData('undefined')).toBeUndefined();
  });

  it('should parse product data', () => {
    const cartProductMock = {
      amount: 999,
      id: 'CNG_AST',
      name: 'Flexible Travel Dates',
    };
    expect(parseProductData(cartProductMock)).toEqual({
      name: 'Flexible Travel Dates',
      price: 999,
      quantity: 1,
      sku: 'CNG_AST',
    });

    expect(parseProductData(undefined)).toBeUndefined();
  });

  describe('GETTERS: ', () => {
    it('should get flight numbers string from Odo', () => {
      const originOdoMock: Odo = head((head(itineraryMock) as any).odoList);
      expect(getFlightNumbersStringFromOdo(originOdoMock)).toEqual('SA2014, SA234');
    });

    it('should get airline names from odo', () => {
      const destinationOdoMock: Odo = head((last(itineraryMock) as any).odoList);
      expect(getAirlineNamesFromOdo(destinationOdoMock, searchResultsMock.airlineNames)).toEqual(
        'South African Airways, South African Airways'
      );
    });

    it('should get total from itineraries', () => {
      expect(getTotalFromItineraries(itineraryMock)).toEqual(53009);
    });

    it('should get language from the languagCode', () => {
      expect(getLanguage('en')).toEqual('english');
      expect(getLanguage('ar')).toEqual('arabic');
      expect(getLanguage('tr')).toEqual('turkish');
    });

    it('should get country from the GZ countryCode', () => {
      expect(getCountry('GZ')).toEqual('South Africa');
    });

    it('should get country from the AE countryCode', () => {
      expect(getCountry('AE')).toEqual('United Arab Emirates');
    });

    it('should get country from the NG countryCode', () => {
      expect(getCountry('NG')).toEqual('Nigeria');
    });

    it('should get country from the SA countryCode', () => {
      expect(getCountry('SA')).toEqual('Saudi Arabia');
    });

    it('should get country from the ZA countryCode', () => {
      expect(getCountry('ZA')).toEqual('South Africa');
    });

    it('should get country from the no countryCode', () => {
      expect(getCountry('')).toEqual('ANY');
    });

    it('should get currency from the countryCode', () => {
      expect(getCurrencyCode('GZ')).toEqual('ZAR');
      expect(getCurrencyCode('AE')).toEqual('AED');
      expect(getCurrencyCode('BH')).toEqual('BHD');
      expect(getCurrencyCode('BW')).toEqual('BWP');
      expect(getCurrencyCode('DZ')).toEqual('DZD');
      expect(getCurrencyCode('EG')).toEqual('EGP');
      expect(getCurrencyCode('GH')).toEqual('GHS');
      expect(getCurrencyCode('GO')).toEqual('USD');
      expect(getCurrencyCode('JO')).toEqual('JOD');
      expect(getCurrencyCode('KE')).toEqual('USD');
      expect(getCurrencyCode('KW')).toEqual('AED');
      expect(getCurrencyCode('LY')).toEqual('LYD');
      expect(getCurrencyCode('MA')).toEqual('MAD');
      expect(getCurrencyCode('MW')).toEqual('MWK');
      expect(getCurrencyCode('NA')).toEqual('NAD');
      expect(getCurrencyCode('NG')).toEqual('NGN');
      expect(getCurrencyCode('OM')).toEqual('OMR');
      expect(getCurrencyCode('QA')).toEqual('QAR');
      expect(getCurrencyCode('PK')).toEqual('PKR');
      expect(getCurrencyCode('SA')).toEqual('AED');
      expect(getCurrencyCode('TZ')).toEqual('TZS');
      expect(getCurrencyCode('ZA')).toEqual('ZAR');
      expect(getCurrencyCode('ZW')).toEqual('USD');
      expect(getCurrencyCode('')).toEqual('USD');
    });

    it('should get birthdate from the user', () => {
      const emptyuserprofileDetailsMock = [];
      expect(moment(getBirthDateFromUser(USER_PROFILE_DETAILS_MOCK)).format('YYYY-MM-DD')).toEqual('1988-06-16');

      expect(getBirthDateFromTraveller(emptyuserprofileDetailsMock)).toEqual('not provided');
    });

    it('should get birthdate from the traveller', () => {
      const cartTravellerMock = {
        baggageSelection: [],
        email: 'fred@travelstart.com',
        firstName: 'FRED',
        id: 'd3a73b6f-0363-4296-9fcd-2e9da45d0100',
        lastName: 'DUPLESSIS',
        passengerCount: 1,
        phone: '+27643101594',
        title: 'Mr',
        traveller: {
          dob: {
            day: 16,
            month: 6,
            year: 1988,
          },
          firstName: 'FRED',
          lastName: 'DUPLESSIS',
          title: 'Mr',
        },
        type: 'ADULT',
      };
      const emptyCartTravellerMock = [];
      expect(getBirthDateFromTraveller(cartTravellerMock.traveller)).toEqual('1988-06-16');

      expect(getBirthDateFromTraveller(emptyCartTravellerMock)).toEqual('not provided');
    });

    it('should get gender from the user', () => {
      const emptyUserProfileDetailsMock = [];
      expect(getGenderFromUser(USER_PROFILE_DETAILS_MOCK)).toEqual('male');

      expect(getGenderFromUser(emptyUserProfileDetailsMock)).toEqual('not provided');
    });

    it('should get gender from the title', () => {
      expect(getGenderFromTitle('Mr')).toEqual('male');
    });

    it('should first name from the user', () => {
      expect(getFirstName(USER_PROFILE_DETAILS_MOCK)).toEqual('Fred');
    });

    it('should get last name from the user', () => {
      expect(getLastName(USER_PROFILE_DETAILS_MOCK)).toEqual('du Plessis');
    });

    it('should get email from the user', () => {
      expect(getEmail(USER_PROFILE_DETAILS_MOCK)).toEqual('fred@travelstart.com');
    });

    it('should get phone number from the user', () => {
      expect(getPhoneNumber(USER_PROFILE_DETAILS_MOCK)).toEqual('+270643101594');
    });
  });
});
