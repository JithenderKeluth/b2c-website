import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';
import AppServerModule from './app.server.module';
import { setPlatform } from './app/general/utils/widget.utils'; 

setPlatform(true);

if (environment.production) {
  enableProdMode();
}

// This bootstraps the server
import('./server/server.main')
  .then(() => {
    console.log('Travelstart SSR server started');
    console.log(`Environment: ${environment.production ? 'Production' : 'Development'}`);
    console.log(`Server URL: ${environment.serverUrl}`);
    console.log(`API URL: ${environment.API_URL}`);
  })
  .catch((err) => {
    console.error('Failed to start Travelstart SSR server:', err);
  });

export default AppServerModule;