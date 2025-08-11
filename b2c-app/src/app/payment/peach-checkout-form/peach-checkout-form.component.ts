import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
declare const Checkout: any;
@Component({
  selector: 'app-peach-checkout-form',
  templateUrl: './peach-checkout-form.component.html',
  styleUrls: ['./peach-checkout-form.component.scss'],
})
export class PeachCheckoutFormComponent implements OnInit {
  constructor(public activatedRoute: ActivatedRoute) {}
  @Input() peachCheckoutData: any = null;
  peachScriptUrl: any = null;
  isLoading: boolean = false;
  checkoutId: any = null;
  entityId: any = null;
  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((val: any) => { 
      if (val) {
        this.checkoutId = val.checkoutId;
        this.entityId = val.entityId;
        this.peachScriptUrl = val.checkoutJs;
      }
    });
    this.appendPeachScript();
    setTimeout(() => {
      this.initPeachCheckout();
    }, 3000);
  }
  /**here we are adding external script for peach payments */
  appendPeachScript() {
    if(typeof window === 'undefined' || typeof document === 'undefined') return;
    const scriptEl = window.document.createElement('script');
    let scriptSrc = this.peachScriptUrl;
    scriptEl.src = scriptSrc;
    document.body.appendChild(scriptEl);
  }
  /**here we are initiate peach payment with entityId & checkoutId. these are get fron initiate API response   */
  initPeachCheckout() {
    const checkout = Checkout.initiate({
      key: this.entityId,
      checkoutId: this.checkoutId,
      options: {
        theme: {
          brand: {
            primary: "#EC5228",
            secondary: "#111927",
          },
          cards: {
            background: "#ffffff",
            backgroundHover: "#F3F3F4",
          },
        },
      },
       
    });
    this.isLoading = false;
    checkout.render('#payment-form');
  }
}
