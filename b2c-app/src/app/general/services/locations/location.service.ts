import { Injectable } from '@angular/core';

import { compact, isEmpty, isString, map, reverse, filter } from 'lodash';

import { Location } from './location.model';
import { HttpClient } from '@angular/common/http';

import { ApiService } from '../api/api.service';
import { Router } from '@angular/router';
import { SearchService } from '@app/flights/service/search.service';

@Injectable()
export class LocationService {
  private apiService: ApiService;
  private static readonly WEBSTORE_ORIGIN_KEY = 'autocomplete_history_from';
  private static readonly WEBSTORAGE_DESTINATION_KEY = 'autocomplete_history_to';

  //private locationsLoadedSubject: Subject<AutocompleteResult>;

  public constructor(private httpClient: HttpClient, private searchService: SearchService, private router: Router) {}

  public fetchLocationInformation(locationCode: string, locationType: string): Promise<Location> {
    let url = 'https://wapi.travelstart.com/website-services/api/ac-location';

    return new Promise<Location>((resolve, reject) => {
      this.httpClient
        .post(url, { locationCode, locationType })
        .toPromise()
        .then(
          (response) => {
            resolve(new Location(response));
          },
          (error) => { 
            this.searchService.changeShowSpinner(false);
            this.router.navigate([''], { queryParamsHandling: 'preserve' });
            reject();
          }
        );
    });
  }

  /**
   * Parses NG1 stored format
   *
   * @param storedList
   */
  private parseOldFormatStoredList(storedList: any): any {
    if (!storedList) {
      return storedList;
    }

    // these were stored in reverse 0.o
    // `reverse()` mutates the given array so clone the stored list before reversing or risk
    // re-reversing each time this method is called
    const reversedList = reverse([...storedList]);

    const result = compact(
      map(reversedList, (location) => {
        if (!location) {
          return null;
        }

        return isString(location) ? JSON.parse(location) : location;
      })
    );

    return result;
  }

  private getWebStorageKey(direction: any): string {
    if (direction && direction.toLowerCase().match(/origin/)) {
      return LocationService.WEBSTORE_ORIGIN_KEY;
    }

    return LocationService.WEBSTORAGE_DESTINATION_KEY;
  }
}
