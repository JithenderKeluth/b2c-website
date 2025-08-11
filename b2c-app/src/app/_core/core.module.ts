import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { RouteReuseStrategy, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { RouteReusableStrategy } from './route-reusable-strategy';
import { ApiPrefixInterceptor } from './http/api-prefix.interceptor';
import { ErrorHandlerInterceptor } from './http/error-handler.interceptor';
import { responsiveService } from './services/responsive.service';
import { LocalStorageService } from './local-storage/local-storage.service';
import { WINDOW_PROVIDER } from '../../assets/window.providers';

@NgModule({ imports: [CommonModule, TranslateModule, RouterModule], providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: ApiPrefixInterceptor,
            multi: true,
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: ErrorHandlerInterceptor,
            multi: true,
        },
        {
            provide: RouteReuseStrategy,
            useClass: RouteReusableStrategy,
        },
        WINDOW_PROVIDER,
        responsiveService,
        provideHttpClient(withInterceptorsFromDi()),
    ] })
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    // Import guard
    if (parentModule) {
      throw new Error(`${parentModule} has already been loaded. Import Core module in the AppModule only.`);
    }
  }
}

export { LocalStorageService };
