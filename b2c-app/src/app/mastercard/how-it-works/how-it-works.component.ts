import { Component } from '@angular/core';
import { SharedModule } from '../../_shared/shared.module';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './how-it-works.component.html',
  styleUrl: './how-it-works.component.scss'
})
export class HowItWorksComponent {

}
