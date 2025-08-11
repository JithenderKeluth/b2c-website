import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LpModuleRoutingModule } from './lp-module-routing.module';
import { MarkdownModule } from 'ngx-markdown';
import { SharedModule } from '@shared/shared.module';
import { FlightsModule } from './../flights/flights.module';
import { CMSService } from './cms.service';

import { AirlinePageComponent } from './airline-page/airline-page.component';
import { AirlinesComponent } from './airlines/airlines.component';
import { HeroComponent } from './components/hero/hero-component.component';
import { AccordianComponent } from './components/accordian/accordian.component';
import { GeneralUspComponent } from './components/general-usp/general-usp.component';
import { FlightRoutesComponent } from './components/flight-routes/flight-routes.component';
import { FooterLinksComponent } from './components/footer-links/footer-links.component';

@NgModule({
  declarations: [
    HeroComponent,
    AccordianComponent,
    GeneralUspComponent,
    FlightRoutesComponent,
    FooterLinksComponent,
    AirlinesComponent,
    AirlinePageComponent,
  ],
  imports: [
    CommonModule,
    LpModuleRoutingModule,
    MarkdownModule.forRoot(),
    SharedModule,
    FlightsModule
  ],
  providers: [CMSService]
})
export class LpModule { }
