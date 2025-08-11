import { Component } from '@angular/core';
import { SharedModule } from '../../_shared/shared.module';

@Component({
  selector: 'app-curated-stays',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './curated-stays.component.html',
  styleUrl: './curated-stays.component.scss'
})
export class CuratedStaysComponent {

}
