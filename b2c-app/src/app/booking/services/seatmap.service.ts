import { findIndex, includes, isUndefined, lowerCase } from 'lodash';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';

import { isPlatformBrowser } from '@angular/common';
import { WINDOW } from './../../general/services/window.service';

// import { TokenService } from 'price/seat-map/token.service';
// const CREDENTIALS = 'dHJhdmVsU3RhcnRQcm9kOndlbGNvbWluZ1N0aWNreVplYnJh';
// const SERVICE_VERSION = 'V2.2';
// const BASE_URL = 'https://bws.amadeus.com';
// const SCRIPT_SRC = 'https://bws.amadeus.com/seatmaps/takeoff.min.js';
// const testAmadeusUrl = 'https://test.travel.api.amadeus.com/v1/security/oauth2/token';

const testSeatmapFlightOfferUrl = 'https://test.travel.api.amadeus.com/v1/shopping/seatmaps';
const testOAUthTokenUrl = 'https://travel.api.amadeus.com/v1/security/oauth2/token';
// const API_KEY = 'G5YGydzN5cQXUoUlPj9G2ouhyewNIsvy';
// const API_SECRET = 'vmbW40mrS9hch3VS';

/* Sandbox test credentials
  const API_KEY = 'G5YGydzN5cQXUoUlPj9G2ouhyewNIsvy'; // This value is just an example
  const API_SECRET = 'vmbW40mrS9hch3VS'; // This value is just an example
  const API_HOST = 'https://travel.api.amadeus.com';
  let GUEST_OFFICE_ID = 'CPTS128TS'; // used in case your agency is using multiple OIDs on the same market/USAP to switch to a different OID from the default one bound to key and secret
*/

const API_KEY = 'ZzUWKx7NbKwHtwa7WWATnu70ErGW9OtG'; // This value is just an example
const API_SECRET = '4Hr8VNCpWPTVRAjL'; // This value is just an example
let GUEST_OFFICE_ID = 'CPTS12801'; // used in case your agency is using multiple OIDs on the same market/USAP to switch to a different OID from the default one bound to key and secret

/**
 * For the seatmap to load we need to supply the plugin with firstName and surname,
 * but we load the seatmap before we have this information, so we provide a placeholder
 * string in the mean-time, and update the values as we receive them via user input
 */
const PLACEHOLDER_STRING = 'default';

@Injectable()
export class SeatmapService {
  private travellerdata = new BehaviorSubject(<any>[]);
  currentTravellerData = this.travellerdata.asObservable();

  public seatData = new BehaviorSubject(<any>{});
  public currentSeatData = this.seatData.asObservable();

  private coreController: any;
  // Keep track of the currentSegmentId so it doesn't need to be passed in when selecting a deck
  private currentSegmentId: number;
  private accessToken: any;
  private priceModel: any;
  private isBrowser: boolean;

  public constructor(
    private httpClient: HttpClient, // private tokenService: TokenService, // private upgradeModule: UpgradeModule
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.currentSegmentId = 0;
    this.accessToken = undefined;
  }

  public getPriceModel(): any {
    if (!this.priceModel) {
      // this.priceModel = this.upgradeModule.injector.get('PriceModel');
    }

    return this.priceModel;
  }

  updateTravellers(item: any) {
    this.travellerdata.next(item);
  }

  updateSeatData(data: any) {
    this.seatData.next(data);
  }

  public setupScript(): // travellers: BookingDataTravellers,
  // itineraries: SearchResultsItinerary[],
  // containsSeatSelection: boolean,
  Promise<any> {
    return new Promise((resolve, reject) => {
      this.injectScript()
        .then((response) => {
          resolve(response);
        })
        .catch((error: any) => {
          reject({ error, message: 'Script injection failed' });
        });
    });
  }

  public getToken(GUEST_OFFICE_ID: string): Promise<string> {
    if (this.accessToken) {
      return Promise.resolve(this.accessToken);
    }
    return this.refreshToken(GUEST_OFFICE_ID);
  }

  public refreshToken(GUEST_OFFICE_ID: string): Promise<string> {
    this.accessToken = this.requestToken(GUEST_OFFICE_ID);
    return this.accessToken;
  }

  public requestToken(GUEST_OFFICE_ID: string): Promise<any> {
    const url = testOAUthTokenUrl;

    const header = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
    };
    const body = `grant_type=client_credentials&client_id=${API_KEY}&client_secret=${API_SECRET}&guest_office_id=${GUEST_OFFICE_ID}`; // add this as param if needed &guest_office_id=${GUEST_OFFICE_ID}

    return new Promise<string>((resolve, reject) => {
      this.httpClient.post<any>(url, body, header).subscribe(
        (data) => {
          resolve(data.access_token);
        },
        (error) => {
          
          reject({ error: error });
        }
      );
    });
  }

  public clearEventListeners(): void {
    this.coreController.removeEventListener('seat_selected');
    this.coreController.removeEventListener('seat_unselected');
    this.coreController.removeEventListener('seat_deselected');
    this.coreController.removeEventListener('seat_end_hover');
    this.coreController.removeEventListener('seat_begin_hover');
  }

  ///// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> OLD

  public addEventListeners(
    selectSeat: (selectedSeat: any) => void,
    deselectSeat: (selectedSeat: any) => void,
    seatBeginHover: (selectedSeat: any) => void,
    seatEndHover: (selectedSeat: any) => void
  ): void {
    this.coreController.addEventListener('seat_selected', selectSeat);
    this.coreController.addEventListener('seat_begin_hover', seatBeginHover);
    this.coreController.addEventListener('seat_end_hover', seatEndHover);
    /**
     * The Amadeus plugin can sometimes behave erratically.
     * The plugin gets updated frequently and as a result the 'seat_unselected'
     * event was changed to 'seat_deselected'
     * Below we listen for both events in case they fall back to the previous one.
     */
    this.coreController.addEventListener('seat_unselected', deselectSeat);
    this.coreController.addEventListener('seat_deselected', deselectSeat);
  }

  public selectSegment(segmentId: number): Promise<any> {
    return new Promise<{ decks: any[]; mainDeckIndex: number }>((resolve, reject) => {
      if (!this.coreController || this.coreController.data.seatMaps[segmentId].status !== 'OK') {
        reject('No seat map found for selected segment');
      }

      const decks = this.coreController.data.seatMaps[segmentId].decks;
      const mainDeckIndex = this.getMainDeckIndex(decks);
      this.currentSegmentId = segmentId;
      this.coreController.select(segmentId, mainDeckIndex);
      resolve({ decks, mainDeckIndex });
    });
  }

  public selectDeck(deckIndex: number): void {
    this.coreController.select(this.currentSegmentId, deckIndex);
  }

  public selectTraveller(travellerIndex: number): void {
    // this.coreController.selectPassenger(travellerIndex);  //To Do uncomment if issue
  }

  public clearSeatSelection(): void {
    if (!this.coreController) {
      return;
    }
    this.coreController.unselectAll();
  }

  private getMainDeckIndex(decks: object[]): number {
    const mainDeckIndex = findIndex(decks, (deck: any) => includes(lowerCase(deck.deckType), 'main'));

    return mainDeckIndex === -1 ? 0 : mainDeckIndex;
  }

  private injectScript(): Promise<void> {
    if (!this.isBrowser) return;
    return new Promise<void>((resolve, reject) => {
      // if (!isUndefined(this.window.browserWindow.SeatMapCore)) {
      //     resolve();

      //     return;
      // }
      // const SCRIPT_SRC = 'https://ts-flapp.s3.eu-west-1.amazonaws.com/seatmap/seatmap.js';
      const SCRIPT_SRC = 'https://cdn1.travelstart.com/assets/js/seat_map.js';
      // const scriptTag = this.window.browserWindow.document.createElement('script');
      const scriptTag = window.document.createElement('script');
      scriptTag.type = 'text/javascript';
      scriptTag.async = true;
      scriptTag.src = SCRIPT_SRC;
      scriptTag.onload = () => {
        resolve();
      };
      // scriptTag.onError = () => {
      //     reject();
      // };
      const bodyElement = window.document.getElementsByTagName('body')[0];
      bodyElement.appendChild(scriptTag);
    });
  }

  private subject = new Subject<any>();
  sendUpdatedPrice() {
    this.subject.next();
  }
  getUpdatedPrice(): Observable<any> {
    return this.subject.asObservable();
  }
}
