import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './../../general/services/api/api.service';

@Injectable()
export class AppSessionService {
  private _user: any;
  public _assetsPath: any;
  private data: any = {};

  constructor(
    private apiService: ApiService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  user() {
    return this._user;
  }

  isWhiteLabelInstance(): boolean {
    return this.apiService.extractCountryFromDomain() !== 'ZA';
  }

  assetsPath(): string {
    return this._assetsPath;
  }

  setUser(name: string): any {
    if (!this.data || !this.data[name]) {
      console.warn(`AppSessionService: No user config found for '${name}'`);
      this._user = null;
      this._assetsPath = null;
      return null;
    }

    this._user = this.data[name];
    this._assetsPath = this._user.assetsPath;
    return this._user;
  }

  init(): Promise<boolean> {
    const defaultUserKey = 'default';

    if (!isPlatformBrowser(this.platformId)) {
      this.data = {
        [defaultUserKey]: {
          assetsPath: '/assets/img/', 
          isWhiteLabelInstance: false,
          externalCSS: null
        }
      };
      this.setUser(defaultUserKey);
      return Promise.resolve(true);
    }

    const url = 'https://s3.eu-west-2.amazonaws.com/fastpix.travelstart.com/assets/json/appconfig.json';

    return this.http.get<any>(url).toPromise().then(result => {
      this.data = result;
      this.setUser(defaultUserKey);
      return true;
    }).catch(error => {
      console.error('AppSessionService: Failed to load config:', error);
      this.data = {
        [defaultUserKey]: {
          assetsPath: '/assets/img/',
          isWhiteLabelInstance: false,
          externalCSS: null
        }
      };
      this.setUser(defaultUserKey);
      return true;
    });
  }

}
