
import { Component, OnInit, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { CabinClass } from '../models/cabin-class.model';
import { SessionService } from '@app/general/services/session.service';
import moment from 'moment';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
declare var $ :any
@Component({
  selector: 'app-user-travellers',
  templateUrl: './user-travellers.component.html',
  styleUrls: ['./user-travellers.component.scss', '../search/search.component.scss'],
})
export class UserTravellersComponent implements OnInit {
  public cabinClassSelected: string;
  public cabinClass: CabinClass;
  public userTravellers: any[] = [];
  public selectedTravellers: any[] = [];
  public paxList: any;
  activeTab : string;
  @Output() passengers: EventEmitter<any> = new EventEmitter<any>();
  @Input() set userActiveTab(tabValue:any){
    if(tabValue){
      this.activeTab = tabValue
      this.selectedTravellers = [];
        this.initializeTravellers();
    }
  } 
  @Output() dataEmitter: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('menuTrigger') trigger :any;
  travellersSummary = {
    adults: 0,
    youngAdults: 0,
    children: 0,
    infants: 0,
    total: 0,
  };

  errorMessage = '';

  constructor(private sessionService: SessionService, private storage: UniversalStorageService) {}

  ngOnInit(): void {
    this.sessionService.sessionData$.subscribe((data) => {
      if (data) {
        this.selectedTravellers = [];
        this.initializeTravellers();
      }
    });
  }

  /**
   * Initialize traveller data from session storage and sort by type.
   */
  public initializeTravellers(): void {
    const credentials = this.storage.getItem('credentials', 'session');
    if (!credentials) {
      console.error('No credentials found in sessionStorage.');
      return;
    }

    try {
      this.paxList = JSON.parse(credentials);
      const travellerList = this.paxList?.data?.travellerList;
      if (!Array.isArray(travellerList)) {
        console.error('Invalid traveller list format.');
        return;
      }

      // Process and sort traveller data
      this.userTravellers = travellerList.map(this.processTravellerData).sort((a, b) => {
        const order = { ADULT: 1, YOUNGADULT: 2, CHILD: 3, INFANT: 4 };
        return (order[a.paxType] || 5) - (order[b.paxType] || 5);
      });

      // Default selection for PRINCIPAL role
      let sessionTravellers = this.storage.getItem('mmfTravellerData', 'session') ? JSON.parse(this.storage.getItem('mmfTravellerData', 'session')) : null;
      if (sessionTravellers?.length > 0  && this.activeTab !== 'cars') {
        this.restoreSelectedTravellers();
      } else {
        const principalTraveler = this.userTravellers.find(
          (pax) => pax.clientNumber === this.paxList?.data?.loggedInClientNumber
        );
        if (principalTraveler && this.activeTab !== 'cars') {
          principalTraveler.paxSelected = true;
          this.selectedTravellers.push(principalTraveler);
        }
        this.storage.setItem('mmfTravellerData', JSON.stringify(this.selectedTravellers), 'session');
        this.generateTravellerSummary();
        this.dataEmitter.emit(this.selectedTravellers);
      }
    } catch (error) {
      console.error('Error parsing credentials:', error);
    }
  }

  /**
   * Process each traveller data, calculate properties, and sort the list.
   */
  private processTravellerData(pax: any): any {
    const birthDate = new Date(pax.birthDate);
    if (isNaN(birthDate.getTime())) {
      return { ...pax, paxType: 'UNKNOWN' };
    }
    const todayDate = new Date()
    const ageInMonths = (todayDate.getFullYear() - birthDate.getFullYear()) * 12 + (todayDate.getMonth() - birthDate.getMonth());
    let paxType = 'UNKNOWN';
    if (ageInMonths >= 192) paxType = 'ADULT';
    else if (ageInMonths >= 144) paxType = 'YOUNGADULT';
    else if (ageInMonths > 24) paxType = 'CHILD';
    else if (ageInMonths <= 24) paxType = 'INFANT';

    return { ...pax, paxType, paxSelected: false };
  }

  /**
   * Restore selected travellers from session storage.
   */
  private restoreSelectedTravellers(): void {
    const storedTravellers = this.storage.getItem('mmfTravellerData', 'session');
    if (storedTravellers) {
      this.selectedTravellers = JSON.parse(storedTravellers);
      this.userTravellers.forEach((pax) => {
        pax.paxSelected = this.selectedTravellers.some((selectedPax) => selectedPax.travellerId === pax.travellerId);
      });
      this.generateTravellerSummary();
      this.dataEmitter.emit(this.selectedTravellers);
    }
  }

  /**
   * Handle traveller selection or deselection.
   */
  selectedCPax: any = this.userTravellers.find((pax) => pax.paxSelected);
  selectPax(pax: any): void {
    // Ensure no multiple selections when 'cars' is the active tab
    if (this.activeTab === 'cars') {
      this.selectedTravellers = [];
      // Deselect all other passengers
      // Only keep the current pax
      pax.paxSelected = !pax.paxSelected;
      this.selectedTravellers = [pax];
      this.userTravellers.forEach((otherPax) => {
        otherPax.paxSelected = otherPax.travellerId == pax.travellerId;
      });
    } else {
      pax.paxSelected = !pax.paxSelected;

      if (pax.paxSelected) {
        this.selectedTravellers.push(pax);
      } else {
        this.selectedTravellers = this.selectedTravellers.filter(
          (selectedPax) => selectedPax.travellerId !== pax.travellerId
        );
      }
      let adultsLength = this.selectedTravellers.filter((x:any) => x.paxType == 'ADULT').length;
      let infantsLength = this.selectedTravellers.filter((x:any) => x.paxType == 'INFANT').length;
      if(adultsLength == 0 || adultsLength < infantsLength){
        this.trigger.closeMenu();
        $('#noAdultsModal').modal('show');
      }
    }

    // Update the session storage and generate the traveller summary
    this.updateSessionStorage();
    this.generateTravellerSummary();
  }

  /**
   * Update session storage with the latest traveller data.
   */
  private updateSessionStorage(): void {
    this.paxList.data.travellerList = this.userTravellers;
    this.storage.setItem('credentials', JSON.stringify(this.paxList), 'session');
    this.storage.setItem('mmfTravellerData', JSON.stringify(this.selectedTravellers), 'session');
    if (this.activeTab === 'cars') {
      this.dataEmitter.emit(this.selectedTravellers);
    }
  }

  generateTravellerSummary(): void {
    const summary = { adults: 0, youngAdults: 0, children: 0, infants: 0, total: 0 };

    this.selectedTravellers.forEach((passenger) => {
      switch (passenger.paxType) {
        case 'ADULT':
          summary.adults++;
          break;
        case 'YOUNGADULT':
          summary.youngAdults++;
          break;
        case 'CHILD':
          summary.children++;
          break;
        case 'INFANT':
          summary.infants++;
          break;
      }
    });

    summary.total = summary.adults + summary.youngAdults + summary.children + summary.infants;

    if (summary.total > 9) {
      this.errorMessage = 'Total passengers cannot exceed 9.';
      return;
    }

    if (summary.children + summary.infants + summary.youngAdults > summary.adults) {
      this.errorMessage = 'Children, infants, and young adults cannot exceed the number of adults.';
      // return;
    }

    this.errorMessage = '';
    this.travellersSummary = summary;
    this.passengers.emit(this.travellersSummary);
  }

  onChange(event: Event): void {
    if (this.activeTab !== 'cars') {
      event.stopPropagation();
    }
  }
  /**her we are filter traveller for cars we need to show only adult travellers for cars */
  getTravellers(travellers :any){
    if(this.activeTab === 'cars' ){
     return travellers.filter((x:any)=> x.paxType == 'ADULT');
    }else{
     return travellers;
    }
  }
}
