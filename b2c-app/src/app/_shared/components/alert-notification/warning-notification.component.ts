import { Component, OnInit, Input } from '@angular/core';
import { ApiService } from '../../../general/services/api/api.service';
import { NavigationService } from '../../../general/services/navigation.service';
import { MyAccountServiceService } from '../../../my-account/my-account-service.service';
import { AbsaAuthService } from '../../../general/services/absa-auth.service';
import { BridgeService } from '../../../general/services/standardbank/bridge.service';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { SessionService } from '../../../general/services/session.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-warning-notification',
  templateUrl: './warning-notification.component.html',
  styleUrl: './warning-notification.component.scss'
})
export class WarningNotificationComponent implements OnInit{
  @Input() notificationTitle: string = '';
  @Input() hideTitle: boolean = false;
  @Input() hideIcon: boolean = false;

  public region: string;
  public loading = false;
  sessionId: string | null = null;

  constructor(public apiService: ApiService, public navService: NavigationService, private myacountService: MyAccountServiceService,
    private absaAuthService: AbsaAuthService, private bridgeService: BridgeService, private router: Router, private sessionService: SessionService,
    private route: ActivatedRoute
  ) {
    this.region = this.apiService.extractCountryFromDomain();
  }

  ngOnInit(): void {
    
  }

}
