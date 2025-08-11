
import { ContactService } from './../contact.service';
import { IframeWidgetService } from '@app/general/services/iframe-widget.service';
import { Component, ElementRef, OnInit, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { responsiveService } from '@app/_core';
import { SearchService } from '@app/flights/service/search.service';
import { ApiService } from '@app/general/services/api/api.service';
import { SessionUtils } from '@app/general/utils/session-utils';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import ZA_Contact_Options from './../contact-us-reason.json';
import NG_Contact_Options from './../NG-contact-us.json';
import { CustomDateParser } from '@app/general/utils/CustomDateParser';
import { numInputNoChars } from '@app/flights/utils/odo.utils';
import { getCountriesArray } from '@app/booking/utils/traveller.utils';
import { CountryCodes } from '@app/general/utils/country-code';
import CT_Contact_Options from './../clubhub-contact-us.json';
import { I18nService } from '@app/i18n';
import { SearchCountryField, CountryISO, PhoneNumberFormat } from 'ngx-intl-tel-input';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { isPlatformBrowser } from '@angular/common';


declare const $: any;
const getMonth = (idx: any) => {
  const objDate = new Date();
  objDate.setDate(1);
  objDate.setMonth(idx - 1);
  const locale = 'en-us';
  const month = objDate.toLocaleString(locale, { month: 'short' });
  return month;
};
@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss', './../../../theme/country_selection.scss'],
  providers: [{ provide: NgbDateParserFormatter, useClass: CustomDateParser }],
})
export class ContactFormComponent implements OnInit {
  public contactUsForm: FormGroup;
  public submitContactUsForm = false;
  public requests = true;
  public travelAlerts = false;
  public faq = false;
  public chatToUs = false;
  public tsCountry: any;
  public successMsg = false;
  public contactUsApiErrors: any = null;
  public cancellationCategoryError = false;
  public showTrAlerts = false;
  public isPaxNameDuplicted = false;
  public selectedTab: any = 'existBooking';
  public activeTab: string;
  months = Array(12)
    .fill(0)
    .map((_i, idx) => getMonth(idx + 1));
  @ViewChild('email') email: ElementRef;
  @ViewChild('name') name: ElementRef;
  @ViewChild('surName') surName: ElementRef;
  @ViewChild('bookingReference') bookingReference: ElementRef;
  @ViewChild('category') category: ElementRef;
  @ViewChild('message') message: ElementRef;
  @ViewChild('contactNumber') contactNumber: ElementRef;
  @ViewChild('subCategory') subcategory: ElementRef;
  contactFormCategories: any = null;
  countriesList: any = [];
  selectedYear = 2004;
  selectedMonth = 1;
  selectedDay = 1;
  dobArray: any = [];
  psExpYearArray: any = [];
  public countryName: any;
  public expminDate = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
  };
  public expmaxDate = {
    year: new Date().getFullYear() + 50,
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
  };
  public selectedMainCategory: any = '';
  public subCategories: any = [];
  public selectedSubCategory: any;
  public showWheelChairCategories = false;
  public countryCode: string;
  isB2BApp: boolean = false;
  organization: string = 'ZA';
  questionsList:any = null;

  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];
  selectedCountryCode:string = CountryISO.UnitedStates ;
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private fb: FormBuilder,
    private sessionUtils: SessionUtils,
    private apiService: ApiService,
    private ngbDateParserFormatter: NgbDateParserFormatter,
    public responsiveservice: responsiveService,
    private searchService: SearchService,
    private iframewidgetService: IframeWidgetService,
    private contactService: ContactService,
    private i18nService: I18nService,
    private storage: UniversalStorageService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.detectUserCountry();
    this.activeTab = this.selectedTab;
    this.initSendMessageForm();
    this.isB2BApp = Boolean(this.iframewidgetService.isB2BApp());
    this.getOrganization();
    this.setBookingTypeValidators();
    this.tsCountry = this.apiService.extractCountryFromDomain();
    if (isPlatformBrowser(this.platformId)) {
      this.countriesList = getCountriesArray();
    }
    this.getContactCategories();
    this.getDobYears();
  }

  filterEmailCharacters(event: any): void {
    const input = event.target;
    const allowedPattern = /[^a-zA-Z0-9@._-]/g; // anything not in the allowed set
    const cleaned = input.value.replace(allowedPattern, '');

    input.value = cleaned;
    this.contactUsForm.get('email')?.setValue(cleaned, { emitEvent: false });
  }

  filterNameInput(event: any): void {
    const input = event.target;
    const allowedPattern = /[^a-zA-Z\-']/g;  // Disallow anything except letters, hyphen, apostrophe
    const cleaned = input.value.replace(allowedPattern, '');

    input.value = cleaned;
    const controlName = input.getAttribute('formControlName');
    this.contactUsForm.get(controlName)?.setValue(cleaned, { emitEvent: false });
  }

  public detectUserCountry = () => {
    this.countryCode = this.selectedCountryCode;
    let userCountry = JSON.parse(this.storage.getItem('userCountry', 'session')) ;
    if(userCountry){ // user country from session ?
      for (let x in CountryCodes) {
        if (CountryCodes[x].code === userCountry.country) {
          this.countryCode = CountryCodes[x].code;
          this.selectedCountryCode = this.countryCode ;
        }
      }
    }else{ // auto detect user country
      this.i18nService.userCountry$.subscribe((data) => {
        if (data){
          for (let x in CountryCodes) {
            if (CountryCodes[x].code === data.country) {
              this.countryCode = CountryCodes[x].code;
              this.selectedCountryCode = this.countryCode ;
            }
          }
        }
      });
    }
  }

  /**setting the years range*/
  public getDobYears() {
    let year = new Date().getFullYear();
    for (let i = 1; i <= 111; i++) {
      this.dobArray.push(year - i);
    }
    for (let j = 0; j <= 20; j++) {
      this.psExpYearArray.push(year + j);
    }
  }
  /**It will sort the category names and returns the sorted array*/
  getSortedArray(categoryArray: any) {
    categoryArray = categoryArray.sort((a: any, b: any) => a.category.localeCompare(b.category));
    return categoryArray;
  }

  selectBookingType(bookingType: string) {
    this.activeTab = bookingType;
    this.setBookingTypeValidators();
  }
  setBookingTypeValidators() {
    this.initSendMessageForm();
    if (this.activeTab === 'existBooking') {
      this.contactUsForm.get('bookingReference').setValidators(Validators.required);
      this.contactUsForm.get('category').setValidators(Validators.required);
    }
  }
  initSendMessageForm() {
    this.contactUsForm = this.fb.group({
      name: ['', [Validators.required]],
      surName: ['', [Validators.required]],
      email: ['', [Validators.pattern('[a-zA-Z0-9._+-]{1,}@[a-zA-Z0-9.-]{2,}[.]{1}[a-zA-Z]{2,}'), Validators.required]],
      bookingReference: [''],
      category: [''],
      message: [''],
      passportNumber: [''],
      psExpDay: [''],
      psExpMonth: [''],
      psExpYear: [''],
      passportExpiry: null,
      nationality: [''],
      passPortCountry: [''],
      paxNames: this.fb.array([this.createNameControl()]),
      contactNumber: ['', [Validators.required]],
      returnDate: [],
      cancellingRoute: [],
      deptDate: [],
      subcategory: [''],
    });
  }
  createNameControl() {
    return this.fb.control('');
  }
  get nameControls() {
    return this.contactUsForm?.get('paxNames') as FormArray;
  }
  /*detect the select option value  */
  selectChange() {
    this.contactUsApiErrors = null;
    this.cancellationCategoryError = false;
    this.subCategories = this.contactUsForm?.get('category')?.value?.subCategories;
    if (this.contactUsForm?.get('category')?.value) {
      this.contactUsForm?.get('subcategory').setValue('');
    }
    this.setCategoryValidations();
  }
  /**Validations based on category changes*/
  setCategoryValidations() {
    let contactCategory: string = 'subcategory' ;
    if (this.contactUsForm?.get(contactCategory)?.value?.categoryKey === 'PASSPORT_DETAILS') {
      this.contactUsForm.get('passportNumber').setValidators(Validators.required);
      this.contactUsForm.get('passportExpiry').setValidators(Validators.required);
      this.contactUsForm.get('nationality').setValidators(Validators.required);
      this.contactUsForm.get('passPortCountry').setValidators(Validators.required);
    } else if (this.contactUsForm?.get(contactCategory)?.value?.categoryKey === 'CANCELLATION_REFUND_QUOTE') {
      this.contactUsForm.get('paxNames').setValidators(Validators.required);
      this.contactUsForm.get('cancellingRoute').setValidators(Validators.required);
    } else if (
      this.contactUsForm?.get(contactCategory)?.value?.categoryKey === 'CHANGES' ||
      this.contactUsForm?.get(contactCategory)?.value?.categoryKey === 'CONFIRMATION_DATE_CHANGE'
    ) {
      this.contactUsForm.get('paxNames').setValidators(Validators.required);
    } else {
      this.setValidations();
    }
  }
  setValidations() {
    const formControlsToFocus = [
      'passportNumber',
      'passportExpiry',
      'nationality',
      'passPortCountry',
      'cancellingRoute',
      'deptDate',
      'returnDate',
    ];
    for (const controlName of formControlsToFocus) {
      const control = this.contactUsForm?.get(controlName);
      control.setValidators(null);
      control.updateValueAndValidity();
    }
  }
  selectSubCategory() {
    let contactCategory: string;
    contactCategory = 'subcategory' ;
    this.setCategoryValidations();
    if (
      this.contactUsForm?.get(contactCategory)?.value?.questionnaire_json
    ) {
      this.questionsList = this.contactUsForm?.get(contactCategory)?.value?.questionnaire_json;
      this.showWheelChairCategories = true;
      this.addQuestionControls(this.questionsList,'addControls');
    }else{
      this.addQuestionControls(this.questionsList,'removeControls');
    } 
  }
  /**checks the airline for the selected subcategory */
  getAirlineLink() {
    return this.contactUsForm?.get('subcategory')?.value && this.contactUsForm?.get('subcategory')?.value?.categoryKey == null && !this.contactUsForm?.get('subcategory')?.value?.email;
  }
  /**Here it is checking the name of the pax is duplicated */
  duplicateNameCheck(index: number): boolean {
    const nameControls = this.contactUsForm.get('paxNames') as FormArray;
    const currentName = nameControls.controls[index].value;
    for (let i = 0; i < nameControls.length; i++) {
      if (currentName && i !== index && nameControls.controls[i].value === currentName) {
        this.isPaxNameDuplicted = true;
        return this.isPaxNameDuplicted;
      }
    }
    this.isPaxNameDuplicted = false;
    return this.isPaxNameDuplicted;
  }
  addName() {
    if (this.nameControls.length < 9) {
      const nameControl = this.createNameControl();
      this.nameControls.push(nameControl);
    }
  }
  removeName(index: number) {
    this.nameControls.removeAt(index);
  }
  sendMessage() {
    if (this.contactUsForm.get('subcategory').value === '' || this.contactUsForm.get('subcategory').invalid) {
      this.scrollToElementWithId('subCategory', 'subcategory');
    }
    this.submitContactUsForm = true;
    if (this.contactUsForm.valid) {
      this.checkFormValidity();
    } else if (this.contactUsForm.invalid) {
      this.scrollToElementWithId('category', 'category');
      const formControlsToFocus = [
        { controlName: 'name', element: this.name },
        { controlName: 'surName', element: this.surName },
        { controlName: 'email', element: this.email },
        { controlName: 'bookingReference', element: this.bookingReference },
        { controlName: 'message', element: this.message },
      ];
      for (const { controlName, element } of formControlsToFocus) {
        const control = this.contactUsForm.get(controlName);
        if (control?.invalid) {
          element?.nativeElement.focus();
          return;
        }
      }
    }
  }
  checkFormValidity() {
    let contactCategory: string;
    contactCategory =  'subcategory';
    if (
      (this.contactUsForm?.get('category')?.value !== '' &&
        this.contactUsForm?.get('subcategory')?.value !== '' &&
        !this.contactUsForm?.get(contactCategory)?.value?.isbookingreferncemandatory) ||
      this.activeTab == 'newBooking'
    ) {
      let contactEmail: any;
      if (this.activeTab === 'newBooking') {
        contactEmail = 'travelhub@travelstart.com';
        this.contactUsForm.get(contactCategory).setValue(this.getNewBookingRequestData());
      } else {
        const email = this.contactUsForm.get(contactCategory)?.value.email;
        contactEmail =
          this.tsCountry !== 'FS' ? email : this.checkingFSMetaEmails(this.contactUsForm.get(contactCategory).value);
      }
      let emailUrl =
        `https://mail.google.com/mail/?view=cm&fs=1&to=${contactEmail}&su=` +
        this.getContactUsData().categoryKey +
        '&contact number =' +
        this.contactUsForm.get('contactNumber').value?.number +
        '&body=' +
        this.getContactUsData().message;
      this.contactUsForm.reset();
      this.submitContactUsForm = false;
      if (this.isBrowser) {
        window.open(emailUrl, '_blank');
      };
    } else {
      this.createRequest();
    }
  }
  /**Checking FS Meta emails */
  checkingFSMetaEmails(categoryValue: any) {
    if (this.tsCountry === 'FS') {
      if (categoryValue?.categoryKey.includes('Baggage')) {
        return 'baggagequeries@flightsight.co.za';
      } else if (
        categoryValue?.categoryKey.includes('I made a booking') ||
        categoryValue?.categoryKey.includes('Payment enquiry')
      ) {
        return 'paymentqueries@flightsite.co.za';
      }
    }
  }
  getContactUsData() {
    let messageData: string = '';
    let contactCategory: string;
    contactCategory = 'subcategory';
    let commentInfo = this.contactUsForm.get('message').value != '' ? this.contactUsForm.get('message').value + ',' : '';
    if (this.contactUsForm.get(contactCategory).value.categoryKey === 'CANCELLATION_REFUND_QUOTE') {
      messageData = commentInfo + this.getPaxDetails('CANCELLATION_REFUND_QUOTE');
    } else if (
      this.contactUsForm.get(contactCategory).value.categoryKey === 'CHANGES' ||
      this.contactUsForm.get(contactCategory).value.categoryKey === 'CONFIRMATION_DATE_CHANGE'
    ) {
      messageData = commentInfo + this.getPaxDetails('CHANGES');
    } else if (this.contactUsForm.get(contactCategory).value.categoryKey === 'PASSPORT_DETAILS') {
      messageData = commentInfo + this.createPassportMessage();
    } else if (this.contactUsForm.get(contactCategory).value?.questionnaire_json) {
      messageData = commentInfo + this.createQuestionsMessage(this.contactUsForm.get(contactCategory).value.questionnaire_json);
    } else {
      messageData =
      commentInfo + 'Contact number : ' + this.contactUsForm.get('contactNumber').value?.number;
    }
    return {
      bookingRef: this.contactUsForm.get('bookingReference').value,
      name: this.contactUsForm.get('name').value,
      surname: this.contactUsForm.get('surName').value,
      categoryKey: this.contactUsForm.get(contactCategory).value.categoryKey,
      email: this.contactUsForm.get('email').value,
      message: messageData,
      correlationId: this.sessionUtils.getCorrelationId(),
    };
  }
  /**It returns the passenger details based on category key */
  getPaxDetails(category: string) {
    const paxNames = this.contactUsForm.get('paxNames').value.filter(Boolean);
    if (category === 'CANCELLATION_REFUND_QUOTE') {
      return (
        ' Name of passenger : ' +
        paxNames.join(', ') +
        ',Mobile Number : ' +
        this.contactUsForm.get('contactNumber').value?.number +
        ',Route cancelling : ' +
        this.contactUsForm.get('cancellingRoute').value?.number +
        ', Contact number : ' +
        this.contactUsForm.get('contactNumber').value?.number
      );
    } else {
      const deptDate = this.ngbDateParserFormatter.format(this.contactUsForm.get('deptDate').value);
      const returnDate = this.ngbDateParserFormatter.format(this.contactUsForm.get('returnDate').value);
      return (
        ' Name of passenger : ' +
        paxNames.join(', ') +
        ',Mobile Number : ' +
        this.contactUsForm.get('contactNumber').value?.number +
        ',Departure Date : ' +
        deptDate +
        ',Return Date : ' +
        returnDate
      );
    }
  }
  /* genereate description user select  passport details option */
  createPassportMessage() {
    return (
      ' Passport Number : ' +
      this.contactUsForm.get('passportNumber').value +
      ',Passport Expiry : ' +
      this.contactUsForm.get('passportExpiry').value +
      ',Nationality : ' +
      this.contactUsForm.get('nationality').value +
      ',Passport issuing Country : ' +
      this.contactUsForm.get('passPortCountry').value +
      ', Contact number : ' +
      this.contactUsForm.get('contactNumber').value?.number
    );
  }
  /* genereate description for Questions and answers */
  createQuestionsMessage(questionList:any) {
    let questionsMessage : string =''
    Object.entries(questionList).forEach(
      ([key, value]) => { 
        questionsMessage = questionsMessage.concat(`${value} : ${this.contactUsForm.value[key]},`)
      }
    );
    return questionsMessage;
  }
  getNewBookingRequestData() {
    return {
      category: 'New Booking Request',
      isbookingreferncemandatory: false,
      email: 'travelhub@travelstart.com',
      type: 'New booking',
      categoryKey: 'New Booking Request',
    };
  }
  /**scrolling the input for the categories invalid */
  scrollToElementWithId(id: string, category: any) {
    if(typeof document === 'undefined') return;
    if (this.contactUsForm.get(category).value == '' || this.contactUsForm.get(category).invalid) {
      let element = document.getElementById(id);
      if (element) {
        return element.scrollIntoView({ behavior: 'auto', block: 'start' });
      }
    }
  }
  //raise a request To TCC
  createRequest() {
    this.contactUsApiErrors = null;
    if (this.checkCategoryKeys()) {
      return;
    } else {
      this.getContactUsData()
      this.searchService.contactEnquiry(this.getContactUsData()).subscribe(
        (data: any) => {
          this.contactResponseData(data);
        },
        (error) => {
          if (error) {
            if (error.error) {
              $('#query_failed_Modal').modal('show');
              this.successMsg = false;
            }
          }
        }
      );
    }
  }
  /**checking the selected categories */
  checkCategoryKeys() {
    let contactCategory: string;
    contactCategory = 'subcategory';
    const category = this.contactUsForm?.get(contactCategory)?.value?.categoryKey;
    const paxNames = this.contactUsForm?.get('paxNames')?.value;
    if (
      !category ||
      ((category === 'CHANGES' || category === 'CANCELLATION_REFUND_QUOTE') &&
        (this.showPaxNameError(paxNames) || this.isPaxNameDuplicted))
    ) {
      return true;
    } else {
      return false;
    }
  }
  /**handling the API response for the submitting the query */
  contactResponseData(data: any) {
    if (data.errors) {
      
      if (
        !this.checkUrgentCancellation(data.errors[0].errorWarningAttributeGroup) &&
        data.errors[0].errorWarningAttributeGroup
      ) {
        this.contactUsApiErrors = data.errors[0].errorWarningAttributeGroup.shortText;
        this.successMsg = false;
      } else if (this.checkUrgentCancellation(data.errors[0].errorWarningAttributeGroup)) {
        return;
      }
    } else {
      this.successMsg = true;
      this.initSendMessageForm();
      this.submitContactUsForm = false;
      $('#query_success_Modal').modal('show');
    }
  }
  /*checks contact category is urgent cancellation*/
  checkUrgentCancellation(errors: any) {
    if (this.getContactUsData()?.categoryKey === 'CANCELLATION' && errors?.code === '48405') {
      this.contactUsApiErrors = null;
      this.cancellationCategoryError = true;
    } else {
      this.cancellationCategoryError = false;
    }
    return this.cancellationCategoryError;
  }
  showPaxNameError(paxNames: any): boolean {
    return (paxNames?.length === 1 && paxNames[0] === '') || paxNames?.every((pax: any) => pax === '');
  }
  // allows users to type only numbers
  onlyNumberKey(event: any): void {
    numInputNoChars(event);
  }
  /* OEM
  telInputObject(obj: any) {
    this.countryName = obj;
    if (obj && this.countryCode) {
      obj.setCountry(this.countryCode);
    }
  }
  */

  getContactCategories() {
    let domainCountry = this.tsCountry == 'ABSA' ? 'absa' : this.tsCountry == 'SB' ? 'sbsa': 'za';
    this.contactService.getContactUsFormCategories(domainCountry).subscribe(
      (res: any) => {
         
        if (res?.data?.attributes?.contact_reason?.length > 0) {
          this.contactFormCategories = res?.data?.attributes?.contact_reason;
          this.contactFormCategories = this.getSortedArray(this.contactFormCategories);
          this.updateCategories();
        } else {
          this.getStaticContactCategories();
        }
      },
      (error: any) => {
        this.getStaticContactCategories();
      }
    );
  }
  /**if we are not getting any categories from API or error case we can load contact categories from JSon files  */
  getStaticContactCategories() {
    if (this.iframewidgetService.isB2BApp() && this.iframewidgetService.b2bOrganization() == 'TS_CT') {
      this.contactFormCategories = CT_Contact_Options.contact_reason;
    } else if (this.tsCountry == 'NG') {
      this.contactFormCategories = NG_Contact_Options.contact_reason;
    } else {
      this.contactFormCategories = ZA_Contact_Options.contact_reason;
    }
    this.contactFormCategories = this.getSortedArray(this.contactFormCategories);
  }
  /**here we are filter categories & sub-categories based on organization value when organization not NG   */
  updateCategories() {
    this.contactFormCategories.forEach((x: any) => {
      x.subCategories = x.subCategories.filter((y: any) => this.subCategorieshasOrganization(y));
    });
    this.contactFormCategories = this.contactFormCategories.filter((x: any) =>
      this.mainCategoryhasOrganization(x?.subCategories)
    );
     
  }
  /**here are consider orgaization for display categories & sub-categories based organization value */
  getOrganization() {
    if(this.storage.getItem('B2BOrganization', 'session')){
      this.organization = this.storage.getItem('B2BOrganization', 'session')?.split('_')[1];
    }else if (this.iframewidgetService.isB2BApp() && this.iframewidgetService.b2bOrganization()) {
      this.organization = this.iframewidgetService.b2bOrganization().split('_')[1];
    }else{
      this.organization = this.apiService.extractCountryFromDomain();
    }
  }
  /**here we are checking any sub-categories have organization value within the main categories for filter main categories */
  mainCategoryhasOrganization(subcategories: any) {
    return subcategories.some((x: any) => x.organisations?.includes(this.organization));
  }
  /**here we are checking any sub-category have organization or not to filter main categories */
  subCategorieshasOrganization(category: any) {
    return category.organisations?.includes(this.organization);
  }
  ngAfterViewInit() {
    let categorySelected: string;
    categorySelected = 'subcategory';
    this.contactUsForm.get(categorySelected).valueChanges.subscribe((val: any) => {
      if (val?.isbookingreferncemandatory) {
        this.contactUsForm.get('bookingReference').setValidators([Validators.required]);
      } else {
        this.contactUsForm.get('bookingReference').setValidators(null);
        this.contactUsForm.get('bookingReference').reset();
      }
    });
  }
  ngOnDestroy() {
    $('#query_failed_Modal').modal('hide');
    $('#query_success_Modal').modal('hide');
  }
  closeSuccessModal() {
    $('#query_success_Modal').modal('hide');
  } 
  addQuestionControls(questionList:any,param:any){
    if(questionList){
      Object.entries(questionList).forEach(
        ([key, value]) => {
          if(param == 'addControls'){
            this.contactUsForm.addControl(key, new FormControl('', [Validators.required]));
          }else if(param == 'removeControls'){
            this.contactUsForm.removeControl(key);
          }
         
        }
      );
    }
  }
}
