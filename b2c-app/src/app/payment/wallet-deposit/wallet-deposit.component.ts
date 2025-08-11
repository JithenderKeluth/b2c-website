import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-wallet-deposit',
  templateUrl: './wallet-deposit.component.html',
  styleUrls: ['./wallet-deposit.component.scss'],
})
export class WalletDepositComponent implements OnInit {
  public flip_Card = false;
  public card_detailsForm: UntypedFormGroup;
  public paymentMethods: any;
  public year = new Date().getFullYear();
  public yearsArray: any = [];
  public expiryYear: number;
  public submitted: boolean = false;
  public invalid_payment: boolean = false;
  public invalid_card: boolean = false;
  public invalid_payment_process = false;
  public invalid_payment_details: boolean = false;
  public cardExpired = false;
  public bookingFailed: boolean = false;
  public cantProcessBooking: boolean = false;
  public credentials: any;
  public selectedCard: any;
  public cardDetails: any;
  public encryptionKey: any;
  constructor(private fb: UntypedFormBuilder, private cdRef: ChangeDetectorRef) {}

  get paymentCardForm() {
    return this.card_detailsForm.controls;
  }
  addAmount = new UntypedFormControl('');
  ngOnInit(): void {
    for (let i = 0; i <= 30; i++) {
      this.yearsArray.push({ year: this.year + i });
    }
    this.initForm();
  }

  initForm(): void {
    this.card_detailsForm = this.fb.group({
      cardNumber: ['', Validators.required],
      cardName: [
        '',
        [
          Validators.pattern("^[a-zA-Z]+[-'s]?[a-zA-Z ]+$"),
          Validators.minLength(3),
          Validators.maxLength(30),
          Validators.required,
        ],
      ],
      cardExpiry: ['', Validators.required],
      cardExpiryMonth: ['', Validators.required],
      cvv: ['', Validators.required],
    });
  }
  ngAfterContentChecked() {
    this.cdRef.detectChanges();
  }
  cardFlip() {
    this.flip_Card = !this.flip_Card;
  }
  cardFlipInit() {
    this.flip_Card = false;
  }
  public getExpiryYear() {
    this.expiryYear = this.card_detailsForm.value.cardExpiry.toString().slice(-2);
  }
  flipTheCard() {
    if (this.card_detailsForm.value.cvv) {
      this.flip_Card = !this.flip_Card;
    }
  }
  public onKeyEnterEvent(event: any) {
    this.invalid_card = false;
      this.invalid_payment_details = false;
      this.invalid_payment = false;
      this.cardExpired = false;
      this.bookingFailed = false;
      this.encryptionKey = '';
  }
  onChangeEvent(e: Event): void {
    this.encryptionKey = '';
  }
  addMoney(value: number) { 
    this.addAmount.setValue(value);
  }
  proceedAddMoney() {
    this.submitted = true;
    if (this.card_detailsForm.invalid) {
      return;
    } else {
       
    }
  }
}
