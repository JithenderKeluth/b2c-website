import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../general/services/api/api.service';
import { VERTEIL_SEAT_LAYOUT_SEARCH } from './../../general/services/api/api-paths';
import { SessionUtils } from './../../general/utils/session-utils';

@Injectable({
  providedIn: 'root',
})
export class AmadeusSeatMapService {
 
  constructor(private http: HttpClient, private apiService: ApiService, private sessionUtils: SessionUtils) {}

  // Fetch Seat Map
  getSeatMap(flightOffer: any): Observable<any> {
    let amadeusUrl = this.apiService.get_amadeus_seats_url();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-client-key' : 'travelstart-web'
    });

    return this.http.post(amadeusUrl, flightOffer, { headers });
  }

  // Fetch Seat Map
  getSeatMapforVerteil(payload: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    let url = `${this.apiService.fetchApiHostUrl()}${VERTEIL_SEAT_LAYOUT_SEARCH}?language=en&correlation_id=${this.sessionUtils.getCorrelationId()}`;

    return this.http.post(url, payload, { headers });
  }
}