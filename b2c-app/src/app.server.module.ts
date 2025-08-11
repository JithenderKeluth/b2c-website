import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { AppModule } from './app/app.module';
import { AppComponent } from './app/app.component';

import { SessionStorageService } from 'ngx-webstorage';
import { SessionStorageServiceStub } from './app/_core/stubs/session-storage-stub.service';

@NgModule({
  imports: [
    AppModule,
    ServerModule
  ],
  providers: [
    {
      provide: SessionStorageService,
      useClass: SessionStorageServiceStub
    }
  ],
  bootstrap: [AppComponent],
})
export default class AppServerModule {}

