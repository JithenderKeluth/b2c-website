import { Injector } from '@angular/core';
import { AppSessionService } from './../../_shared/session/app-session.service';
import { ApiService } from './../../general/services/api/api.service';


export function appInitializerFactory(injector: Injector): () => Promise<void> {
  return async () => {
    const appSessionService = injector.get(AppSessionService);
    const apiService = injector.get(ApiService);

    const isBrowser = typeof window !== 'undefined';

    if (isBrowser && apiService.extractCountryFromDomain() === 'GI') {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    await appSessionService.init();

    const user = appSessionService.user();
    if (isBrowser && user?.isWhiteLabelInstance && user?.externalCSS) {
      const existing = document.getElementById('TenantCustomCss');
      if (existing) {
        existing.remove();
      }

      const link = document.createElement('link');
      link.id = 'TenantCustomCss';
      link.rel = 'stylesheet';
      link.href = `./assets/css/${user.externalCSS}`;
      document.head.appendChild(link);
    }

    return;
  };
}
