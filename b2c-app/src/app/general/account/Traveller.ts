import { FrequentFlyer } from './frequent-flyer.model';
import { PersonName } from './person-name.model';
import { Address } from './address.model';
import { Passport } from './passport.model';
import { FrequentFlyerProgram } from './frequent-flyer-program.model';
import { Telephone } from './telephone.model';

export class Traveller {
  public id: number;
  public title: string;
  public firstName: string;
  public surname: string;
  public middleName: string;
  public dateOfBirth: string;
  public email: string;
  public contactNumber: string;
  public dialingCode: string;
  public passportNumber: string;
  public passportIssuingCountry: string;
  public passportExpiryDate: string;
  public nationality: string;
  public passengerType: number;
  public mealPreference: string; // not used?
  public frequentFlyerDetails: FrequentFlyer[];

  // NG1 personal account fields
  public birthDate: string;
  public personName: PersonName;
  public address: Address;
  public travellerId: string;
  public gender: string;
  public mealOption: string;
  public seatPreference: string;
  public telephoneList: Telephone[];
  public passport: Passport;
  public ffpList: FrequentFlyerProgram[];

  // The below variables are for displaying
  public type?: string;
  public telephone?: Telephone;

  /* travelstart-account: Traveller fields:
   *
   * -- ContactInfo
   * public birthDate: string;  // Exists in this model as dateOfBirth
   * public email: string;  // Exists in this model
   * public personName: PersonName; // Not nested in this model
   * public address: Address; // Not in this model
   *
   * -- PersonName
   * public nameTitle: string;  // Exists in this model as title
   * public givenName: string;  // Exists in this model as firstName
   * public middleName: string;  // Exists in this model
   * public surname: string;  // Exists in this model
   *
   * -- Address
   * public postalCode: string; // Not in this model
   * public cityName: string; // Not in this model
   * public countryName: string; // Not in this model
   * public countryCode: string; // Not in this model
   * public addressLine: string; // Not in this model
   * public streetNmbr: string; // Not in this model
   * public bldgRoom: string; // Not in this model
   */

  constructor() {
    this.personName = new PersonName();
    this.address = new Address();
    this.passport = new Passport();
  }
}
