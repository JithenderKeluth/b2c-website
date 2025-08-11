import { BaggageSelection } from './baggage-selection.model';
// import { SpecialRequests } from 'price/components/special-requests/special-requests.model';
// import { ValidationResults } from 'general/models/validation-results';

export class BookingDataTraveller {
  public firstName: string;
  public lastName: string;
  public baggageSelection: BaggageSelection[];
  public dob: any;
  public email: string;
  public id: string;
  public passengerCount: number;
  public passportExpiry: any;
  // public specialRequests: SpecialRequests;
  public specialRequests: any;

  public title: string;
  public type: 'ADULT' | 'CHILD' | 'INFANT';
  // public validation: ValidationResults;

  constructor(travellerType: 'ADULT' | 'CHILD' | 'INFANT', passengerCount: number) {
    this.baggageSelection = [];
    this.firstName = '';
    this.lastName = '';
    this.email = '';
    this.dob = {};
    this.type = travellerType;
    this.title = '';
    this.id = '';
    this.passengerCount = passengerCount;
    this.passportExpiry = {};
    this.specialRequests = {
      frequentFlyerDetailsList: [],
      mealSelection: '',
      seatDetails: [],
    };
  }
}
