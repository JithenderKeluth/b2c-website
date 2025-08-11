import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AirlinePageComponent } from './airline-page/airline-page.component';
import { AirlinesComponent } from './airlines/airlines.component';

const routes: Routes = [
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class LpModuleRoutingModule { }
