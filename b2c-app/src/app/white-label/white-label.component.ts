import { Component, ElementRef, ViewChild } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { GoogleTagManagerServiceService } from '@app/_core/tracking/services/google-tag-manager-service.service';

@Component({
  selector: 'app-white-label',
  templateUrl: './white-label.component.html',
  styleUrls: ['./white-label.component.scss'],
})
export class WhiteLabelComponent {
  public submitEmail: boolean = false;
  public validEmail: boolean = false;
  public email = new UntypedFormControl('', [
    Validators.required,
    Validators.pattern('^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$'),
  ]);
  @ViewChild('subscribeEmail') subscribeEmail: ElementRef;
  constructor(private googleTagManagerServiceService: GoogleTagManagerServiceService) {}

  subscribeUser() {
    this.submitEmail = true;
    if (this.email.valid) {
      this.validEmail = true;
      const data = {
        email: this.email.value,
        name: '',
        subscribeSignupType: 'TS',
        campaignType: 'Travelstart',
      };
      this.googleTagManagerServiceService.pushNewsletterSubscribeData(data);
      this.submitEmail = false;
      setTimeout(() => {
        this.validEmail = false;
        this.email.reset();
      }, 5000);
    }
    if (!this.email.value) {
      this.subscribeEmail.nativeElement.focus();
    }
  }
}
