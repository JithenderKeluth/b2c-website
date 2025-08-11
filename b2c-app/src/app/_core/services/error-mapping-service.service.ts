import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { S3_BUCKET_PATH, S3_ERROR_MAPPING_PATH } from '@app/general/services/api/api-paths';
import { GoogleTagManagerServiceService } from '@core/tracking/services/google-tag-manager-service.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorMappingServiceService {
  // private errorConfigUrl = 'assets/json/error-mapping.json';
  private errorConfig: any;

  constructor(private http: HttpClient, private googleTagManagerService : GoogleTagManagerServiceService) {
    this.fetchErrorConfig().subscribe(config => {
      this.errorConfig = config;
    });
  }

  private fetchErrorConfig(): Observable<any> {
    const url = `${S3_BUCKET_PATH}${S3_ERROR_MAPPING_PATH}`;
    return this.http.get<any>(url);
  }

  mapError(errors?:any): { category: string, action: string, message: string } {
    if (!this.errorConfig) {
      throw new Error('Error config not initialized');
    }
    for(let x in errors){
      for (const category of Object.keys(this.errorConfig)) {
        const errorType = this.errorConfig[category];
        if (errorType.errorcodes.includes(errors[x].errorWarningAttributeGroup.code)) {
          this.googleTagManagerService.pushErrorMapping(category, errors[x].errorWarningAttributeGroup.code, errorType.action, errorType.message);
          return { category, action: errorType.action, message: errorType.message };
        }
      }
    }

    return { category: 'unknown', action: 'default-action', message: 'Sorry your booking has failed, please try again!' };
  }
}
