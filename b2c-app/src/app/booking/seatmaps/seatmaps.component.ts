import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AmadeusSeatMapService } from './../services/amadeus-seatmap.service';
import { SearchResults } from './../../flights/models/results/search-results.model';
import { forEach } from 'lodash';
import { getCurrencyCode } from '../../_core/tracking/utils/data-layer-parser.utils';
import { ApiService } from './../../general/services/api/api.service';
import { getStorageData } from './../../general/utils/storage.utils';
import { getSegmentList } from './../../flights/utils/search-results-itinerary.utils';
import { SeatmapService } from './../services/seatmap.service';
import { buildDeck, SeatmapFacilitiesDisplayOption } from './seatmaps';
import { responsiveService } from '../../_core';
import { getCitiesNames } from './../../flights/utils/odo.utils';
import { getSeatMarkUpPrice, bindInfantsToAdults } from './../utils/traveller.utils';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
declare const $: any;

@Component({
  selector: 'app-seatmaps',
  templateUrl: './seatmaps.component.html',
  styleUrls: ['./seatmaps.component.scss'],
})
export class SeatmapsComponent implements OnInit {
  @Output() selectedSeatDetails = new EventEmitter<any>();
  @Output() reset_skipSeatMap: EventEmitter<any> = new EventEmitter<any>();
  @Output() page_Loaded: EventEmitter<any> = new EventEmitter<any>();
  seatMapData: any;
  // rows: number[] = [];
  // columns: number[] = [];
  selectedSeats: any[] = [];
  public isMarkupEnabled: boolean;
  public currencyCode: string;
  selectedSeatsData: any = [];
  totalSeatsCost: number = 0;
  groupedSeatData: any = null;
  selectedSegmentIndex: number = 0;
  selectedTravelerIndex: number = 0;
  isAllPaxSeatsNotSelected: boolean = false;
  hasError: boolean = false;
  model_Parent = 'seat-map';
  selectedDeckIndex: number = 0;
  decksForSelSegment: any = [];
  updateSeatStatusData: boolean = false;
  public isSeatmapLoading: boolean;
  public infantsList: any = [];

  selectedTraveler: any;
  selectedSegment: any;
  loading = true;
  pricedResult_data: any;
  public flightsResultsResponse: SearchResults;
  public travellerList: any = [];
  temp_pax_list: any;
  companyName: string;
  private originalSegmentList: any;
  private hasBeenFiltered: boolean = false;

  // payload
  public segmentList: any;
  seatMapSegmentsList: any = null;
  public passengersInitVal: any[] = [];
  public passengerInit: any = [];
  public seatMapResponseData: any;

  public seatMapInfoObject: any = {
    segmentsDataList: [],
    travelerDataList: [],
  };

  //hover
  hoveredSeat: any = null;
  hoveredSeatPrice: any = '';
  hoveredSeatCurrency: string = '';
  hoveredSeatCharacteristics: string[] = [];

  // Mapping of seat characteristics codes to their descriptions
  seatCharacteristics: any = {};

  country: string;

  constructor(
    private amadeusSeatMapService: AmadeusSeatMapService,
    private apiService: ApiService,
    private seatmapService: SeatmapService,
    public responsiveService: responsiveService,
    private storage: UniversalStorageService
  ) {
    this.country = apiService.extractCountryFromDomain();
  }

  ngOnInit(): void {
    this.pricedResult_data = JSON.parse(this.storage.getItem('priceData', 'session'));
    this.currencyCode = this.pricedResult_data?.currencyCode || '';
    this.companyName = this.pricedResult_data?.itineraries[0]?.odoList[0]?.companyName;
    this.flightsResultsResponse = JSON.parse(getStorageData('flightResults'));
    this.page_Loaded.emit(true);
    const extractedSegments = getSegmentList(this.pricedResult_data?.itineraries);
    const segments = this.buildSegmentList(extractedSegments);
    this.segmentList = [{ segments: segments }];
    this.originalSegmentList = JSON.parse(JSON.stringify(this.segmentList));

    this.seatmapService.currentTravellerData.subscribe((currentTraveller) => {
      this.travellerList = currentTraveller.travellersList;
      for (let val in this.travellerList) {
        this.travellerList[val].hasInfant = false;
      }

      this.passengerInitData();
    });

    let seatMapInfoObject = this.storage.getItem('seatMapInfoObject', 'session');
    if (seatMapInfoObject) {
      const parsedData = JSON.parse(seatMapInfoObject);
      this.seatMapInfoObject = parsedData;
      this.hasBeenFiltered = parsedData.hasBeenFiltered || false;
      this.updateSeatStatusData = true;
      this.updatePassengersDetails();
      this.restoreOriginalSegments();
    } else {
      this.updateSeatStatusData = false;
      this.hasBeenFiltered = false;
      this.seatMapInfoObject.segmentsDataList = this.segmentList;
      // this.seatMapInfoObject.travelerDataList = this.travellerList;
      this.seatMapInfoObject.travelerDataList = this.travellerList.filter(
        (traveller: any) => traveller.type !== 'INFANT',
      );
      this.updateSelectedSeatsData();
    }
    this.fetchSeatMap();
  }

  // tokenization and fetching seatmap
  fetchSeatMap(): void {
    this.loading = true;
    this.hasError = false;
    this.isSeatmapLoading = true;

    const payload = this.buildSeatMapRequestPayload();

    this.amadeusSeatMapService.getSeatMap(payload).subscribe({
      next: (data) => {
        // call the verteil seat map
        if (this.companyName === 'Verteil') {
          this.fetchVerteilSeats(data);
        }else{
          this.mappingseats(data);
        }
      },
      error: () => {
        this.hasError = true;
        this.loading = false;
        this.isSeatmapLoading = false;
      },
    });
  }

  private mappingseats(data: any) {
    this.seatMapResponseData = data;
    this.handleSeatMapWarnings(this.seatMapResponseData);
    this.updateSegments();
    this.renderSeatMapGraph();
    this.calculateTotalPriceForAllTravelers();
    this.isSeatmapLoading = false;
    // this.seatMapData = buildDeck(data.data[0].decks[0], SeatmapFacilitiesDisplayOption.SHOW_FACILITIES);
    this.loading = false;
    if (data?.errors || data.errors?.length > 0) {
      this.hasError = true;
    }
  }

  // seatmap payload construction
  // Method to build payload dynamically using the actual structure provided
  private buildSeatMapRequestPayload() {
    // Build segments and assign to segmentList
    this.seatMapSegmentsList = this.segmentList;
    // Passenger initialization
    let passengersInit = this.passengersInitVal;
    this.passengerInit = this.passengersInitVal;

    // Filter and process adults
    let adults = passengersInit
      .filter((passengerData) => passengerData.type !== 'HELD_INFANT')
      .map((passengerData) => ({
        type: passengerData.type,
        firstName: passengerData.first_name,
        lastName: passengerData.last_name,
      }));

    // Filter and process infants, linking them to adults
    let infants = passengersInit
      .filter((passengerData) => passengerData.type === 'HELD_INFANT')
      .map((passengerData) => {
        let parent = adults.find((adult) => `${adult.firstName} ${adult.lastName}` === passengerData.parent_name);
        if (!parent) throw new Error('Not enough adults');
        return {
          type: 'INFANT',
          firstName: passengerData.first_name,
          lastName: passengerData.last_name,
          parentName: parent.firstName + ' ' + parent.lastName,
        };
      });

    this.infantsList = infants;

    // Combine adults and infants into a single passenger list
    let passengersCombo = [...infants, ...adults];
    let passengers: any;
    try {
      passengers = bindInfantsToAdults(passengersCombo);
      //('let passenger bound infant to adults', passengers);
    } catch (error) {
      console.error('let passenger bound infant to adults', error.message);
    }

    // Build the request payload
    let flightOfferPayload = {
      data: [
        {
          id: '1',
          type: 'flight-offer',
          itineraries: this.segmentList.map((route: any) => ({
            segments: route.segments.map((segment: any) => ({
              number: segment.flightNumber,
              departure: {
                iataCode: segment.origin,
                at: segment.date,
              },
              arrival: {
                iataCode: segment.destination,
              },
              carrierCode: segment.carrierCode,
              operating: {
                carrierCode: segment.operating,
              },
              id: segment.id,
            })),
          })),
          travelerPricings: passengers.map((passenger: any, index: any) => {
            const pricing: any = {
              travelerId: passenger.travelerId,
              fareOption: 'STANDARD',
              travelerType: passenger.type,
              fareDetailsBySegment: this.segmentList[0].segments.map((segment: any) => ({
                cabin: segment.cabin,
                fareBasis: segment?.farebasis?.split('/')[0],
                class: segment.classCode,
                segmentId: segment.id,
              })),
            };

            // Conditionally add associatedAdultId if it exists and is not null or undefined
            if (passenger.associatedAdultId != null) {
              pricing['associatedAdultId'] = passenger.associatedAdultId;
            }

            return pricing;
          }),
          price: {
            currency: getCurrencyCode(this.apiService.extractCountryFromDomain()),
          },
        },
      ],
    };
    return flightOfferPayload;
  }

  public buildSegmentList(segments: any[]): any[] {
    const items: any[] = [];
    forEach(segments, (segment: any) => {
      items.push({
        farebasis: segment.fareBasisCode,
        classCode: segment.bookingClass,
        cabin: segment.cabinClass,
        date: segment.departureDateTime,
        origin: segment.origCode,
        destination: segment.destCode,
        // remove airlineCode from the number
        flightNumber: segment.flightNumber.substring(2),
        carrierCode: segment.flightNumber.substring(0, 2),
        marketing: segment.flightNumber.substring(0, 2),
        operating: segment.flightNumber.substring(0, 2),
        id: segment.ID,
      });
    });
    return items;
  }

  /**
   * passenger initilization based on traveller form value
   */
  public passengerInitData() {
    this.passengersInitVal = [];
    if (this.travellerList?.length > 0) {
      this.temp_pax_list = this.travellerList;
      this.travellerList?.forEach((passenger: any, index: number) => {
        if (passenger.type !== 'INFANT') {
          let passengerType = passenger.type == 'YOUNGADULT' || passenger.type == 'ADULT' ? 'ADULT' : passenger.type;
          this.passengersInitVal.push({
            type: passengerType,
            first_name: passenger.firstName,
            last_name: passenger.lastName,
            uId: (() => {
              return this.pax_UserId(index);
            })(),
          });
        } else if (passenger.type === 'INFANT') {
          this.passengersInitVal.push(this.infantBindAdult(passenger, index));
        }
      });
    }
    /** store the passenger intial values in another element for assign userId*/
    if (this.passengerInit.length == 0) {
      this.passengerInit = this.passengersInitVal;
    }
  }

  infantBindAdult(passenger: any, index: number) {
    return {
      type: 'HELD_INFANT',
      first_name: passenger.firstName,
      last_name: passenger.lastName,
      parent_name: (() => {
        for (let pax in this.temp_pax_list) {
          if (this.temp_pax_list[pax].type === 'ADULT' && !this.temp_pax_list[pax].hasInfant) {
            let pax_name = this.temp_pax_list[pax].firstName + ' ' + this.temp_pax_list[pax].lastName;
            this.temp_pax_list[pax]['hasInfant'] = true;
            return pax_name;
          }
        }
      })(),
      uId: (() => {
        return this.pax_UserId(index);
      })(),
    };
  }

  /**
   * assign pax userId to all passengers for identify passengers with seatmap passengersList
   */
  pax_UserId(index: number) {
    if (this.passengerInit.length == 0) {
      return this.travellerList[index]?.firstName + ' ' + this.travellerList[index]?.lastName;
    } else {
      return this.passengerInit[index]?.first_name + ' ' + this.passengerInit[index]?.last_name;
    }
  }

  /**
   * Restore original segments before re-filtering
   */
  private restoreOriginalSegments(): void {
    if (this.originalSegmentList) {
      // Restore original segments to seatMapInfoObject
      this.seatMapInfoObject.segmentsDataList = JSON.parse(JSON.stringify(this.originalSegmentList));

      // Also restore segments in traveler data, preserving any selected seats
      this.seatMapInfoObject.travelerDataList.forEach((traveler: any) => {
        const currentSeats = new Map();

        // Store current seat selections by flight number
        if (traveler.segments) {
          traveler.segments.forEach((segment: any) => {
            if (segment.seat) {
              currentSeats.set(segment.flightNumber, segment.seat);
            }
          });
        }

        // Restore original segments
        traveler.segments = this.originalSegmentList[0].segments.map((originalSegment: any) => {
          const existingSeat = currentSeats.get(originalSegment.flightNumber);
          return {
            ...originalSegment,
            travelerId: traveler.uniqueId,
            seat: existingSeat || null,
          };
        });
      });

      // Reset filtering flag
      this.hasBeenFiltered = false;
    }
  }

  /**
   * after getting the seatmap response check if it contains any warnings from api
   * such as seat not for specific segments, etc.
   */
  handleSeatMapWarnings(response: any) {
    const segmentsToRemove: Set<number> = new Set(); // Use Set to avoid duplicates

    this.seatCharacteristics = response.dictionaries?.seatCharacteristics || null;

    if (response.warnings && !this.hasBeenFiltered) {
      // First pass: Collect all segment indices that need to be removed
      response.warnings.forEach((warning: any) => {
        if (
          warning.title === 'NO SEAT SELECTION ON THIS FLIGHT' ||
          warning.title === 'UNABLE TO RETRIEVE SEATMAP DATA'
        ) {
          const segmentPointer = warning.source.pointer;
          const segmentIndex = this.getSegmentIndexFromPointer(segmentPointer);
          if (segmentIndex !== -1) {
            segmentsToRemove.add(segmentIndex);
          }
        }
      });

      // Second pass: Remove the identified segments from travelerDataList and segmentsDataList[0].segments
      if (segmentsToRemove.size > 0) {
        this.seatMapInfoObject.travelerDataList.forEach((traveler: any) => {
          traveler.segments = traveler.segments.filter((segment: any, index: number) => !segmentsToRemove.has(index));
        });

        // Also update the segmentsDataList[0].segments
        this.seatMapInfoObject.segmentsDataList[0].segments =
          this.seatMapInfoObject.segmentsDataList[0].segments.filter(
            (_: any, index: any) => !segmentsToRemove.has(index),
          );
        this.hasBeenFiltered = true;
      }
    }
    this.selectedTraveler = this.seatMapInfoObject.travelerDataList[0]; // Default traveler
    this.selectedSegment = this.seatMapInfoObject.segmentsDataList[0].segments[0]; // Default segment
    this.selectedSegmentIndex = 0;
    this.selectedTravelerIndex = 0;
  }

  // Helper method to extract segment index from warning pointer
  getSegmentIndexFromPointer(pointer: string): number {
    const regex = /segment\[(\d+)\]/;
    const match = regex.exec(pointer);
    return match ? parseInt(match[1], 10) : -1;
  }

  renderSeatMapGraph(segId?: any) {
    this.decksForSelSegment = [];
    if (this.seatMapResponseData?.data?.length > 0) {
      if (segId) {
        const flightNumber = this.seatMapResponseData.data[segId]?.number;
        this.seatMapResponseData.data[segId].decks[this.selectedDeckIndex].flightNumber = flightNumber;
        this.decksForSelSegment = this.extractDecks(segId);
        let seatData = this.seatMapResponseData.data[segId].decks[this.selectedDeckIndex];
        this.seatMapData = buildDeck(seatData, SeatmapFacilitiesDisplayOption.SHOW_FACILITIES);
      } else {
        const flightNumber = this.seatMapResponseData?.data[0]?.number;
        this.seatMapResponseData.data[0].decks[this.selectedDeckIndex].flightNumber = flightNumber;
        this.decksForSelSegment = this.extractDecks(0);
        let seatData = this.seatMapResponseData.data[0].decks[this.selectedDeckIndex];
        this.seatMapData = buildDeck(seatData, SeatmapFacilitiesDisplayOption.SHOW_FACILITIES);
      }
    }

    this.updateSeatStatusData ? this.updateSeatStatus() : null;
  }
  /**here we are update the segments based on seatmap response bcoz some segments dont have seatmap
   * In this case we are filter those segments display seatmap segments only*/
  updateSegments() {
    if (!this.hasBeenFiltered) {
      this.seatMapInfoObject.segmentsDataList[0].segments = this.seatMapInfoObject.segmentsDataList[0].segments.filter(
        (segment: any) =>
          this.seatMapResponseData.data.some((seatmapSegment) => seatmapSegment.number === segment.flightNumber),
      );
      this.hasBeenFiltered = true;
    }
  }
  extractDecks(segId: any) {
    let decksForSelSegment: any = [];
    this.seatMapResponseData.data[segId]?.decks.forEach((decks: any) => {
      decksForSelSegment.push(decks.deckType);
    });
    return decksForSelSegment;
  }

  changeDeck(idx: number) {
    this.selectedDeckIndex = idx;
    this.renderSeatMapGraph(this.selectedSegment?.id);
  }

  // Get seat by its coordinates (x, y)
  getSeatAt(x: number, y: number) {
    return this.seatMapData.decks[0].seats.find((seat: any) => seat.coordinates.x === x && seat.coordinates.y === y);
  }

  // Check if a seat exists at the given coordinate
  isSeatAvailable(x: number, y: number) {
    return this.getSeatAt(x, y) !== undefined;
  }

  // Method to update seat statuses (selected/blocked) for all seats
  updateSeatStatus() {
    this.seatMapData?.forEach((map: any) => {
      map.rows.forEach((row: any) => {
        row.cells.forEach((cell: any) => {
          if (cell.type === 'seat') {
            cell.isSelected = this.isSeatSelected(cell.seat);
            cell.isBlocked = this.isSeatBlocked(cell.seat);
            cell.isAllowedToChild = this.isNotAllowedToChild(cell.seat);
          }
        });
      });
    });
  }

  isSeatSelected(seat: any): boolean {
    if (this.selectedTraveler && this.selectedSegment) {
      const traveler = this.seatMapInfoObject.travelerDataList.find(
        (traveler: any) =>
          traveler.firstName + traveler.lastName === this.selectedTraveler.firstName + this.selectedTraveler.lastName,
      );

      if (traveler) {
        const segment = traveler.segments.find(
          (segment: any) => segment.flightNumber === this.selectedSegment.flightNumber,
        );

        // Check if the current seat matches the seat in the segment
        if (segment && segment.seat) {
          return segment.seat.number === seat.number;
        }
      }
    }
    return false;
  }

  isSeatBlocked(seat: any): boolean {
    // Loop through all travelers in seatMapInfoObject
    for (const traveler of this.seatMapInfoObject.travelerDataList) {
      // For each traveler, check all their segments
      for (const segment of traveler.segments) {
        // If the seat is selected for this traveler's segment, mark it as selected
        if (segment.seat && segment.seat.number === seat.number) {
          if (traveler.uniqueId === segment.travelerId && segment.flightNumber === this.selectedSegment.flightNumber) {
            return true;
          }
        }
      }
    }
    return false; // Seat is not selected for any traveler or segment
  }
  /**here to check seat selection is allowed to child or not  */
  isNotAllowedToChild(seat: any) {
    return Boolean(this.selectedTraveler.type === 'CHILD' && seat.characteristicsCodes.includes('IE'));
  }

  // Utility function to generate a unique ID for each traveler
  generateUniqueId(traveller: any): string {
    return `pax-${Math.random().toString(36).substr(2, 9)}`;
  }

  updateSelectedSeatsData(newSeatData?: any) {
    // Filter out infants before mapping
    const filteredTravelers = this.seatMapInfoObject.travelerDataList.filter(
      (traveler: any) => traveler.type !== 'INFANT',
    );

    // Use the new filtered travelers list
    this.seatMapInfoObject.travelerDataList = filteredTravelers;

    // This function ensures the new seat data is properly mapped
    const mappedData = this.mapTravellersWithSegments(newSeatData);
    this.seatMapInfoObject.travelerDataList = mappedData;
  }

  // Function to map travelers with segments and selected seats, while adding a unique ID if it doesn't exist
  mapTravellersWithSegments(newSeatData?: any) {
    return this.seatMapInfoObject.travelerDataList.map((traveller: any) => {
      // Only add a unique ID if it doesn't already exist
      if (!traveller.uniqueId) {
        traveller.uniqueId = this.generateUniqueId(traveller);
      }

      return {
        ...traveller,
        segments: this.seatMapInfoObject.segmentsDataList[0].segments.map((segment: any) => {
          // Get the seat assigned for this traveler and segment if it exists
          const seatForSegment = this.getSeatForSegmentInitially(segment.flightNumber, traveller.paxTypeCount);

          // Persist the seat if it was previously assigned, or update with new seatData if passed
          return {
            ...segment,
            travelerId: traveller.uniqueId, // Add the unique traveler ID to the segment
            seat:
              newSeatData && newSeatData.travelerId === traveller.paxTypeCount
                ? newSeatData.seat
                : seatForSegment || null,
          };
        }),
      };
    });
  }

  // Function to get the seat details for a specific traveler and flight segment (this is used during initial mapping)
  getSeatForSegmentInitially(flightNumber: string, paxTypeCount: number) {
    return this.selectedSeats.find((seat: any) => {
      return (
        seat.travelerPricing.some((tp: any) => tp.travelerId === paxTypeCount.toString()) && // Check if seat belongs to traveler
        seat.flightNumber === flightNumber // Check if seat is for the correct flight segment
      );
    });
  }

  // Method to select a seat for a specific traveler and segment
  selectSeat(seat: any) {
    if (seat.seat?.travelerPricing[this.selectedTravelerIndex]?.seatAvailabilityStatus !== 'BLOCKED') {
      // Call the method to update seat selection for this traveler and segment
      this.onSeatSelected(seat.seat);
    }
    this.updateSeatStatus();
  }

  // Update seat data only for the selected traveler and segment
  onSeatSelected(seat: any) {
    const travelerData = this.seatMapInfoObject.travelerDataList.find(
      (trav: any) =>
        trav.firstName + trav.lastName === this.selectedTraveler.firstName + this.selectedTraveler.lastName,
    );

    const segmentData = travelerData.segments.find(
      (seg: any) => seg.flightNumber === this.selectedSegment.flightNumber,
    );
    if (segmentData) {
      if (segmentData.seat && segmentData.seat.number === seat.number) {
        segmentData.seat = null; // Deselect the seat
      } else {
        segmentData.seat = { ...seat, flightNumber: this.selectedSegment.flightNumber }; // Select the new seat
        this.moveToNextTraveler();
      }

      // Update the traveler seat data and selectedSeats array
      this.updateTravelerSeatData();
    }
    this.calculateTotalPriceForAllTravelers();
    //this.checkIfSeatSelectionCompleteForSegment();
    this.updateSelectedSeats();

    this.saveToSessionStorage();

    // sessionStorage.setItem('seatMapInfoObject', JSON.stringify(this.seatMapInfoObject));
  }

  private saveToSessionStorage(): void {
    const dataToSave = {
      ...this.seatMapInfoObject,
      hasBeenFiltered: this.hasBeenFiltered,
    };
    this.storage.setItem('seatMapInfoObject', JSON.stringify(dataToSave), 'session');
  }

  // Update seat data only for the currently selected traveler and segment
  updateTravelerSeatData() {
    this.seatMapInfoObject.travelerDataList = this.seatMapInfoObject.travelerDataList.map((traveler: any) => {
      if (traveler.firstName + traveler.lastName === this.selectedTraveler.firstName + this.selectedTraveler.lastName) {
        return {
          ...traveler,
          segments: traveler.segments.map((segment: any) => {
            if (segment.flightNumber === this.selectedSegment.flightNumber) {
              const seatForSegment = this.getSeatForSegment(segment.flightNumber, traveler.firstName);
              return { ...segment, seat: seatForSegment || null };
            }
            return segment;
          }),
        };
      }
      return traveler;
    });
  }

  // Rebuild selectedSeats array only for the selected traveler and segment
  updateSelectedSeats() {
    this.selectedSeats = this.seatMapInfoObject.travelerDataList.reduce((validSeats: any[], traveler: any) => {
      traveler.segments.forEach((segment: any) => {
        if (segment.seat) {
          validSeats.push(segment.seat);
        }
      });

      return validSeats;
    }, []);
  }

  // Check if the seat is already selected for the current traveler and segment
  isSelected(seat: any) {
    return this.selectedSeats.some(
      (s) =>
        s.number === seat.number &&
        s.flightNumber === this.selectedSegment.flightNumber &&
        s.travelerId === this.selectedTraveler.paxTypeCount,
    );
  }

  // Get the seat for the given segment and traveler
  getSeatForSegment(flightNumber: string, firstName: number) {
    const traveler = this.seatMapInfoObject.travelerDataList.find((trav: any) => trav.firstName === firstName);
    const segment = traveler?.segments.find((seg: any) => seg.flightNumber === flightNumber);
    return segment?.seat || null;
  }

  onTravelerChange(traveler: any, idx: number): void {
    this.selectedTravelerIndex = idx;
    this.selectedTraveler = traveler;
    this.updateSeatStatus();
    this.divScrollIntoView('traveller', idx);
  }

  onSegmentChange(segment: any, idx: number): void {
    this.selectedSegmentIndex = idx;
    this.selectedSegment = segment;
    this.renderSeatMapGraph(segment?.id);
    this.updateSeatStatus();
    this.selectedTravelerIndex = 0;
    this.selectedTraveler = this.seatMapInfoObject.travelerDataList[0];
    this.divScrollIntoView('segment', this.selectedSegmentIndex);
    this.divScrollIntoView('traveller', this.selectedTravelerIndex);
  }

  // fetching the seat information on hover
  isChildNotAllowed(params: any): boolean {
    if (params?.includes('1A') || params?.includes('IE')) {
      return true;
    }
    return false;
  }

  showSeatInfo(cell: any): void {
    this.hoveredSeat = cell;

    if (cell.seat && cell.seat.travelerPricing) {
      const pricing = cell.seat.travelerPricing.find(
        (tp: any) => Number(tp.travelerId) === this.selectedTravelerIndex + 1,
      );
      if (pricing) {
        this.hoveredSeatPrice = this.getSeatFullPrice(
          parseFloat(pricing?.price?.total) || 0,
          getSeatMarkUpPrice(this.pricedResult_data),
        );
        this.hoveredSeatCurrency = pricing?.price?.currency;
      }
      this.hoveredSeatCharacteristics = cell?.seat?.characteristicsCodes;
    }
  }

  hideSeatInfo(): void {
    this.hoveredSeat = null;
    this.hoveredSeatPrice = '';
    this.hoveredSeatCurrency = '';
    this.hoveredSeatCharacteristics = [];
  }

  getCharacteristicDescription(code: string): string {
    return this.seatCharacteristics[code] || 'Unknown';
  }

  /**
   * Calculates the full seat price by adding any markups (defined in the ruletables)
   * to the base seat price
   *
   * @param {Number} basePrice  The base price of the seat
   * @param {String} markupRule  The markup rules for seats as defined in the rule tables
   */
  private getSeatFullPrice(basePrice: number, markupRule: any): number {
    if (!markupRule) {
      return basePrice;
    }
    const freeFlatMarkup = markupRule.free_flat_markup || 0;
    const paidFlatMarkup = markupRule.paid_flat_markup || 0;
    const paidPercentageMarkup = markupRule.paid_percentage_markup || 0;

    const markup = basePrice ? (basePrice * paidPercentageMarkup) / 100 + paidFlatMarkup : freeFlatMarkup;
    return parseFloat(basePrice + markup);
  }

  calculateTotalPriceForAllTravelers(): number {
    let totalPrice = 0;

    this.seatMapInfoObject.travelerDataList.forEach((traveler: any) => {
      traveler.segments.forEach((segment: any) => {
        const seat = segment.seat;
        if (seat && seat.travelerPricing && seat.travelerPricing.length > 0) {
          const pricing = seat.travelerPricing[0]; // Get the first traveler pricing
          const seatPrice = pricing.price?.total ? parseFloat(pricing.price.total) : 0; // Use seat price if available, otherwise 0
          // totalPrice += seatPrice + markupPerSeat; // Add seat price + markup
          totalPrice += this.getSeatFullPrice(seatPrice || 0, getSeatMarkUpPrice(this.pricedResult_data));
        }
      });
    });
    this.totalSeatsCost = totalPrice;
    return totalPrice;
  }

  nextSegment() {
    if (this.selectedSegmentIndex < this.seatMapInfoObject.segmentsDataList[0].segments.length - 1) {
      this.selectedSegmentIndex++;
      this.selectedSegment = this.seatMapInfoObject.segmentsDataList[0].segments[this.selectedSegmentIndex];
      this.renderSeatMapGraph(this.selectedSegmentIndex);
      this.selectedTravelerIndex = 0;
      this.selectedTraveler = this.seatMapInfoObject.travelerDataList[0];
      this.divScrollIntoView('segment', this.selectedSegmentIndex);
      this.divScrollIntoView('traveller', this.selectedTravelerIndex);
    }
  }

  prevSegment() {
    if (this.selectedSegmentIndex > 0) {
      this.selectedSegmentIndex--;
      this.selectedSegment = this.seatMapInfoObject.segmentsDataList[0].segments[this.selectedSegmentIndex];
      this.renderSeatMapGraph(this.selectedSegmentIndex);
      this.divScrollIntoView('segment', this.selectedSegmentIndex);
    }
  }

  checkIfSeatSelectionCompleteForSegment() {
    // Logic to check if seat selection is completed for the current segment
    // For example, checking if the seat object exists in the selected segment
    const currentSegment =
      this.seatMapInfoObject.travelerDataList[this.selectedTravelerIndex].segments[this.selectedSegmentIndex];
    const isSeatSelectionComplete = currentSegment && currentSegment.seat ? true : false;
    if (isSeatSelectionComplete) {
      this.autoSelectNextSegment();
    }
  }

  autoSelectNextSegment() {
    if (this.selectedSegmentIndex < this.seatMapInfoObject.segmentsDataList[0].segments.length - 1) {
      this.selectedSegmentIndex++;
      this.selectedSegment = this.seatMapInfoObject.segmentsDataList[0].segments[this.selectedSegmentIndex];
      this.renderSeatMapGraph(this.selectedSegmentIndex); // Fetch seat details for the next segment

      // Optionally, scroll to the next segment for user clarity
      this.scrollToSegment(this.selectedSegmentIndex);
    } else {
       
      // Logic for when all segments have been selected
      this.moveToNextTraveler();
    }
  }

  scrollToSegment(segmentIndex: number) {
    if(typeof document === 'undefined') return;
    // Optional: Implement smooth scrolling to the next segment in the UI
    const segmentElement = document.querySelectorAll('.segmentsList li')[segmentIndex];
    if (segmentElement) {
      segmentElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  nullSeatsForSelectedTraveler(selectedTravelerIndex: number) {
    // Get the traveler data list
    const travelerDataList = this.seatMapInfoObject.travelerDataList;

    // Check if the selectedTravelerIndex is valid
    if (selectedTravelerIndex >= 0 && selectedTravelerIndex < travelerDataList.length) {
      // Get the segments for the selected traveler
      const updatedTraveler = { ...travelerDataList[selectedTravelerIndex] };

      // Loop through each segment and null the seat information
      updatedTraveler.segments = updatedTraveler.segments.map((segment: any) => {
        return {
          ...segment,
          seat: null, // Set the seat to null
        };
      });

      // Update the travelerDataList with the modified traveler
      this.seatMapInfoObject.travelerDataList = [
        ...travelerDataList.slice(0, selectedTravelerIndex),
        updatedTraveler,
        ...travelerDataList.slice(selectedTravelerIndex + 1),
      ];
      this.selectedSegmentIndex = 0;
      this.updateSeatStatus();
    } else {
      console.error('Invalid traveler index.');
    }
    this.storage.setItem('seatMapInfoObject', JSON.stringify(this.seatMapInfoObject), 'session');
    this.calculateTotalPriceForAllTravelers();
  }

  saveSeats() {
    // const companyName = this.pricedResult_data?.itineraries[0]?.odoList[0]?.companyName || '';
    // Ensure that seatMapInfoObject and travelerDataList exist
    if (!this.seatMapInfoObject?.travelerDataList || !this.travellerList) {
      return; // Exit early if there's no data to process
    }
    this.seatMapInfoObject.travelerDataList.forEach((travelerData: any, index: number) => {
      const traveler = this.travellerList[index];
      if (traveler?.specialRequests) {
        // Update the specialRequests seatDetails for each traveler
        traveler.specialRequests.seatDetails = travelerData.segments
          .filter((segment: any) => segment.seat) // Ensure the segment has seat info
          .map((segment: any, idx: number) => {
            if (this.companyName === 'Verteil') {
              const vt_travelerPricing = segment.seat.travelerPricing[index];
              return {
                flightNumber: segment.carrierCode + segment.seat.flightNumber,
                seatNumber: segment.seat.number,
                price: this.getSeatFullPrice(
                  parseFloat(vt_travelerPricing?.price?.total) || 0,
                  getSeatMarkUpPrice(this.pricedResult_data),
                ),
                basePrice: vt_travelerPricing?.price?.total
                  ? parseFloat(vt_travelerPricing?.price?.total)
                  : Number(0).toFixed(2),
                currency: vt_travelerPricing?.price?.currency ? vt_travelerPricing?.price?.currency : this.currencyCode,
                travellerReference: vt_travelerPricing?.travellerReference,
                travellerIndex: index + 1,
                segmentIndex: idx,
                segmentKey: vt_travelerPricing?.segmentKey,
                seatServiceObjectKey: vt_travelerPricing?.seatServiceObjectKey,
                seatServiceId: vt_travelerPricing?.seatServiceId,
                seatServiceDetails: segment?.seat?.seatServiceDetails,
              };
            } else {
              const travelerPricing = segment.seat.travelerPricing[index];
              return {
                flightNumber: segment.carrierCode + segment.seat.flightNumber,
                seatNumber: segment.seat.number,
                basePrice: travelerPricing?.price?.total
                  ? Number(travelerPricing?.price?.total).toFixed(2)
                  : Number(0).toFixed(2),
                currency: travelerPricing?.price?.currency ? travelerPricing?.price?.currency : this.currencyCode,
                price: this.getSeatFullPrice(
                  parseFloat(travelerPricing?.price?.total) || 0,
                  getSeatMarkUpPrice(this.pricedResult_data),
                ),
              };
            }
          });
      }
    });
  }

  // check all seats are selected or not for every passenger and every segment
  checkSelectedSeats() {
    this.saveSeats();
    if (!this.hasError) {
      setTimeout(() => {
        let allSeatSegmentsList: any = [];
        let seatsSelectionData: any = [];
        this.travellerList.forEach((x: any) => {
          allSeatSegmentsList =
            x.type !== 'INFANT'
              ? allSeatSegmentsList.concat(this.seatMapInfoObject.segmentsDataList[0].segments)
              : allSeatSegmentsList;
          if (x.type !== 'INFANT' && x?.specialRequests?.seatDetails != null) {
            x.specialRequests.seatDetails.forEach((y: any) => {
              seatsSelectionData.push(y);
            });
          }
        });
        this.isAllPaxSeatsNotSelected = Boolean(seatsSelectionData.length !== allSeatSegmentsList.length);
        if (!this.isAllPaxSeatsNotSelected) {
          this.closeSeatMap();
        } else if (this.responsiveService.screenWidth !== 'sm' && this.responsiveService.screenWidth !== 'md') {
          $('#seatNotselected').modal('show');
        }
      }, 1000);
    } else {
      this.closeSeatMap();
    }
  }

  closeSeatMap() {
    this.groupedSeatData = this.seatMapInfoObject.travelerDataList;
    this.selectedSeatDetails.emit(this.groupedSeatData);
    $('#seatNotselected').modal('hide');
    this.isAllPaxSeatsNotSelected = false;
  }

  closeSeatsModal() {
    this.isAllPaxSeatsNotSelected = false;
    $('#seatNotselected').modal('hide');
  }

  // Method to handle seat selection completion for the current traveler
  onTravelerSeatSelectionComplete() {
    // Check if all segments for the current traveler are selected
    if (this.areAllSegmentsCompletedForTraveler()) {
      this.moveToNextTraveler();
    }
  }

  areAllSegmentsCompletedForTraveler(): boolean {
    // Check if all segments for the selected traveler are completed
    return this.selectedTraveler.segments.every((segment: any) => segment.seat && segment.seat.isSelected);
  }

  // Move to the next traveler automatically
  moveToNextTraveler() {
    if (this.selectedTravelerIndex < this.seatMapInfoObject.travelerDataList.length - 1) {
      this.selectedTravelerIndex++;
      if (this.seatMapInfoObject.travelerDataList[this.selectedTravelerIndex].type === 'INFANT') {
        this.selectedTravelerIndex--;
        this.nextSegment();
        return;
      } else {
        this.selectedTraveler = this.seatMapInfoObject.travelerDataList[this.selectedTravelerIndex];
        this.divScrollIntoView('traveller', this.selectedTravelerIndex);
      }
    } else if (
      this.selectedTravelerIndex == this.seatMapInfoObject.travelerDataList.length - 1 ||
      this.seatMapInfoObject.travelerDataList[this.selectedTravelerIndex].type == 'INFANT'
    ) {
      this.nextSegment();
    }
  }
  divScrollIntoView(param: any, index: number) {
    if(typeof document === 'undefined') return;
    let tabInfo = document.getElementById(param + index);
    if (tabInfo && (this.responsiveService.screenWidth == 'sm' || this.responsiveService.screenWidth == 'md')) {
      tabInfo.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
  }
  // Fetch Verteil Seats
  fetchVerteilSeats(amaSeats: any): any {
    let verteilSeatResponse = null;
    // const companyName = this.pricedResult_data?.itineraries[0]?.odoList[0].companyName;
    if (this.companyName === 'Verteil') {
      const data = this.pricedResult_data.data;
      this.amadeusSeatMapService.getSeatMapforVerteil({ data }).subscribe((data) => {
        verteilSeatResponse = this.mergeSeatMaps(amaSeats, data);
        this.mappingseats(verteilSeatResponse);
      });
    }
   // return verteilSeatResponse;
  }

  // Merge Amadeus and Verteil Seat Maps
  mergeSeatMaps(amadeusResponse: any, verteilResponse: any): any {
    const verteilSeatMaps = verteilResponse?.seatMaps || [];
    const amadeusSeatMaps = amadeusResponse?.data || [];

    // Loop through each Amadeus flight segment and merge with Verteil
    amadeusSeatMaps.forEach((amadeusFlight: any) => {
      const amadeusFlightNumber = amadeusFlight.number;
      const verteilFlight = this.findMatchingFlight(verteilSeatMaps, amadeusFlightNumber);

      if (verteilFlight) {
        this.mergeFlightSeats(amadeusFlight.decks, verteilFlight);
      }
    });

    return amadeusResponse;
  }

  // Find a matching Verteil flight segment by flight number
  findMatchingFlight(verteilSeatMaps: any[], amadeusFlightNumber: string): any {
    return verteilSeatMaps.find(
      (verteil: any) => this.normalizeFlightNumber(verteil.flightNumber) === amadeusFlightNumber,
    );
  }

  // Merge Amadeus and Verteil seats within decks
  mergeFlightSeats(decks: any[], verteilFlight: any): void {
    decks.forEach((deck: any) => {
      deck.seats.forEach((amadeusSeat: any) => {
        const matchingVerteilSeat = this.findMatchingSeat(verteilFlight, amadeusSeat.number);

        if (matchingVerteilSeat) {
          matchingVerteilSeat.segmentKey = verteilFlight?.segmentKey;
          this.updateSeatPricing(amadeusSeat, matchingVerteilSeat);
        } else {
          this.disableSeat(amadeusSeat);
        }
      });
    });
  }

  // Update Amadeus seat pricing with Verteil seat details
  updateSeatPricing(amadeusSeat: any, verteilSeat: any): void {
    if (amadeusSeat?.travelerPricing) {
      amadeusSeat.travelerPricing = amadeusSeat.travelerPricing.map((price: any, index: number) => {
        const verteilPricing = verteilSeat.travelerPricing[index];

        return {
          travelerId: price.travelerId,
          seatAvailabilityStatus: verteilPricing?.cabin,
          travellerReference: verteilPricing?.travelerId,
          price: {
            currency: verteilPricing?.price.currency,
            total: verteilPricing?.price.totalFare.toString(),
            base: verteilPricing?.price.baseFare.toString(),
            taxes: verteilPricing?.price.taxFare.toString(),
          },
          seatServiceObjectKey: verteilPricing?.seatServiceObjectKey,
          seatServiceId: verteilPricing?.seatServiceId,
          segmentKey: verteilSeat?.segmentKey
        };
      });

      // Update seat availability based on Verteil's status
      const isAvailable = verteilSeat.travelerPricing.some((pricing: any) => pricing.cabin === 'AVAILABLE');
      this.updateSeatAvailability(amadeusSeat, isAvailable);
    }

    amadeusSeat.seatServiceDetails = verteilSeat.seatServiceDetails;
  }

  // Disable the seat by marking it as BLOCKED
  disableSeat(amadeusSeat: any): void {
    amadeusSeat.travelerPricing.forEach((pricing: any) => {
      pricing.seatAvailabilityStatus = 'BLOCKED';
    });
  }

  // Update seat availability status
  updateSeatAvailability(amadeusSeat: any, isAvailable: boolean): void {
    amadeusSeat.travelerPricing.forEach((pricing: any) => {
      pricing.seatAvailabilityStatus = isAvailable ? 'AVAILABLE' : 'BLOCKED';
    });
  }

  // Normalize flight number (strip leading zeros)
  normalizeFlightNumber(flightNumber: string): string {
    return flightNumber.replace(/^0+/, '');
  }

  // Find matching seat in Verteil seat map based on seat number
  findMatchingSeat(verteilFlight: any, seatNumber: string): any {
    return verteilFlight.cabins?.flatMap((cabin: any) => cabin.seats)?.find((seat: any) => seat.number === seatNumber);
  }

  skipSeats() {
    this.groupedSeatData = this.seatMapInfoObject.travelerDataList;
    this.groupedSeatData && !this.hasError ? this.checkSelectedSeats() : this.reset_skipSeatMap.emit();
    // this.reset_skipSeatMap.emit();
  }
  public getAirportCityName(param: string) {
    return getCitiesNames(param, this.flightsResultsResponse.airportInfos);
  }

  // This function will join the seatCharacteristics array into a single string of class names
  getSeatClass(seat: any): string {
    return seat.characteristicsCodes ? seat.characteristicsCodes.join(' ') : '';
  }

  getSeatCharacteristics(seat: any): string {
    return seat.characteristicsCodes ? seat.characteristicsCodes.join(' ') : '';
  }
  /**To make pax name short with Firstletter of firstname & lastname */
  getPaxShortName(pax: any) {
    return pax.firstName.slice(0, 1) + pax.lastName.slice(0, 1);
  }
  /**To check traveller has selected seats or not  */
  travellerHasSeats(traveller: any) {
    return traveller?.segments?.some((x: any) => x.seat);
  }
  /**To update pax names with  traveller form Data */
  updatePassengersDetails() {
    const nonInfantTravelers = this.travellerList.filter((t: any) => t.type !== 'INFANT');
    this.seatMapInfoObject.travelerDataList.forEach((x: any, index: number) => {
      if (nonInfantTravelers[index]) {
        x.firstName = nonInfantTravelers[index].firstName;
        x.lastName = nonInfantTravelers[index].lastName;
      }
    });
  }

  /**here we are making seat is active when selected segment flightnumber matched with seat flightNumber */
  isSeatActiveOnSegmentSelection(seatInfo:any){
      return Boolean(this.selectedSegment.flightNumber === seatInfo?.flightNumber);
  }
}
