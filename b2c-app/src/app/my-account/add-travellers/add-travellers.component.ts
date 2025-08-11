import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { ApiService } from '@app/general/services/api/api.service';
import { SearchService } from '@app/flights/service/search.service';
import { DatePipe, formatDate } from '@angular/common';
import { MyAccountServiceService } from '@app/my-account/my-account-service.service';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { SessionService } from '../../general/services/session.service';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

import { responsiveService } from '../../_core';
import { BackNavigationEvent } from '../../_shared/components/back-button/back-navigation.event';

@Component({
  selector: 'app-add-travellers',
  templateUrl: './add-travellers.component.html',
  styleUrls: ['./add-travellers.component.scss'],
})
export class AddTravellersComponent implements OnInit {
  formGroup: FormGroup;
  submitted = false;
  region: string;
  public countriesArray: [] = [];
  credentials: any = null;
  userAgent: any;
  saveLocalStorage = false;
  createTraveller: any = {};
  add_error = false;
  errorMsg = '';

  country: string;

  existingTraveller: any;

  maxDateOfBirth = new Date();
  get minPassportExpiry() {
    const today = new Date();

    return today.setMonth(today.getMonth() + 6);
  }

  constructor(
    public dialogRef: MatDialogRef<AddTravellersComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private datePipe: DatePipe,
    public apiService: ApiService,
    private _snackBar: MatSnackBar,
    private myAccountService: MyAccountServiceService,
    private searchService: SearchService,
    private formBuilder: FormBuilder,
    private sessionService: SessionService,
    private storage: UniversalStorageService,
    public responsiveservice: responsiveService,
  ) {
    this.region = this.apiService.extractCountryFromDomain();
    this.existingTraveller = data;
  }

  ngOnInit(): void {
    if (this.storage.getItem('credentials', 'local')) {
      this.saveLocalStorage = true;
      this.credentials = JSON.parse(this.storage.getItem('credentials', 'local'));
    } else if (this.storage.getItem('credentials', 'session')) {
      this.saveLocalStorage = false;
      this.credentials = JSON.parse(this.storage.getItem('credentials', 'session'));
    }

    this.getCountriesList();

    this.formGroup = this.formBuilder.group({
      gender: ['', [Validators.required]],
      firstName: ['', [Validators.pattern("^[a-zA-Z]+[-'s]?[a-zA-Z ]+$"), Validators.required]],

      surName: ['', [Validators.pattern("^[a-zA-Z]+[-'s]?[a-zA-Z ]+$"), Validators.required]],
      middleName: ['', [Validators.pattern("^[a-zA-Z]+[-'s]?[a-zA-Z ]+$")]],
      dob: ['', [Validators.required]],
      email: ['', [Validators.pattern('^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$')]],
      phone: [''],
      passportExpiry: null,
      nationality: '',
      passPortCountry: '',
      passportNumber: ['', [Validators.pattern('^[^s]+[a-zA-Z0-9 _]*[a-zA-Z0-9][a-zA-Z0-9 _]*$')]],
    });

    if (this.existingTraveller) {
      this.setFormValues();
    }

    this.userAgent = this.myAccountService.countrydata;
  }

  setFormValues() {
    this.formGroup.get('gender')?.setValue(this.existingTraveller.personName.nameTitle);
    this.formGroup.get('firstName')?.setValue(this.existingTraveller.personName.givenName);
    this.formGroup.get('surName')?.setValue(this.existingTraveller.personName.surname);
    this.formGroup.get('middleName')?.setValue(this.existingTraveller.personName.middleName);
    this.formGroup.get('dob')?.setValue(formatDate(this.existingTraveller.birthDate, 'yyyy-MM-dd', 'en_US'));
    this.formGroup.get('nationality')?.setValue(this.existingTraveller.passport.docHolderNationality);
    this.formGroup.get('passPortCountry')?.setValue(this.existingTraveller.passport.docIssueCountry);
    this.formGroup.get('passportNumber')?.setValue(this.existingTraveller.passport.passportNumber);

    if (this.existingTraveller.passport.effectiveExpireOptionalDate !== '') {
      this.formGroup
        .get('passportExpiry')
        ?.setValue(formatDate(this.existingTraveller.passport.effectiveExpireOptionalDate, 'yyyy-MM-dd', 'en_US'));
    }
  }

  closeDialog(event?: BackNavigationEvent): void {
  if (event) {
    event.preventDefault(); 
  }
  this.dialogRef.close();
}

  openDatePicker(picker: MatDatepicker<any>) {
    picker.open();
  }

  get travellerForm() {
    return this.formGroup.controls;
  }

  checkDate(date: any) {
    const convertedDate = new Date(date);
    if (convertedDate) {
      return new Date() < convertedDate;
    } else {
      return false;
    }
  }

  getCountriesList() {
    this.searchService.fetchCountries().subscribe((countries: any) => {
      this.countriesArray = countries.sort((a: any, b: any) => a.name.localeCompare(b.name));
    });
  }

  checkDob() {
    if (this.checkDate(this.formGroup?.get('dob')?.value)) {
      this.formGroup.get('dob').setErrors({ invalid: true });
    }
  }

  getFormattedDate(date: any) {
    return this.datePipe.transform(date, 'MMM d, yyyy');
  }

  setValues(data: any) {
    const birthDate = this.getFormattedDate(this.formGroup.get('dob').value);
    let expdate: any;
    if (this.formGroup.get('passportExpiry').value) {
      expdate = this.getFormattedDate(this.formGroup.get('passportExpiry').value);
    } else {
      expdate = null;
    }

    this.createTraveller = {
      traveller: {
        personName: {
          givenName: data.firstName,
          surname: data.surName,
          middleName: data.middleName,
          nameTitle: data.gender,
        },
        Address: {},
        passport: {
          docHolderNationality: data.nationality,
          docIssueCountry: data.passPortCountry,
          passportNumber: data.passportNumber,
          effectiveExpireOptionalDate: expdate,
        },
        email: data.email,
        passengerType: 10,
        birthDate: birthDate,

        telephoneList: [],
      },
      userAgent: this.userAgent,
    };
  }

  onSubmit() {
    this.submitted = true;
    this.checkDob();
    if (this.formGroup.invalid) {
      return;
    } else {
      this.setValues(this.formGroup.value);
      if (this.formGroup?.value?.passportExpiry) {
        if (this.checkDate(this.formGroup?.value?.passportExpiry)) {
          if (this.existingTraveller) this.updatePaxValues();
          else this.submitAddPaxForm();
        }
      } else if (!this.formGroup.value.passportExpiry) {
        if (this.existingTraveller) this.updatePaxValues();
        else this.submitAddPaxForm();
      }
    }
  }

  updatePaxValues() {
    this.myAccountService
      .updateTraveller(this.existingTraveller.travellerId, this.createTraveller)
      .subscribe((res: any) => {
        if (res.result === 'OK' && res.code === 200) {
          this.credentials = res;

          this.formGroup.reset();
          this.submitted = false;
          this.add_error = false;
          //store data in session storage & local storage
          this.sessionService.setStorageDataInSession(res, this.saveLocalStorage);
          this.dialogRef.close();
          this._snackBar.open('Traveller updated Successfully', '');
          setTimeout(() => {
            this._snackBar.dismiss();
          }, 3000);
        } else if (res.result !== 'OK' && res.code !== 200) {
          this.add_error = true;
          this.errorMsg = res.result;
        }
      });
  }

  submitAddPaxForm() {
    this.myAccountService.addTravellers(this.createTraveller).subscribe((res: any) => {
      if (res.result === 'OK' && res.code === 200) {
        this.credentials = res;
        this.formGroup.reset();
        this.submitted = false;
        this.add_error = false;
        //store data in session storage & local storage
        this.sessionService.setStorageDataInSession(res, this.saveLocalStorage);

        this.dialogRef.close();
        this._snackBar.open('Traveller added Successfully', '');
        setTimeout(() => {
          this._snackBar.dismiss();
        }, 3000);
      } else if (res.result !== 'OK' && res.code !== 200) {
        this.add_error = true;
        this.errorMsg = res.result;
      }
    });
  }
}
