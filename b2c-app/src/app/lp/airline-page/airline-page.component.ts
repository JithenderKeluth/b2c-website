import { Component, Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CMSService } from '../cms.service';
import moment from 'moment';


@Component({
  selector: 'app-airline-page',
  templateUrl: './airline-page.component.html',
  styleUrls: ['./airline-page.component.scss'],
})
@Injectable({
  providedIn: 'root',
})
export class AirlinePageComponent implements OnInit {
  public loading = false;
  public path: string[] = [];
  public slug: string = '';
  public errors: any;
  public searchExpanded = false;
  public carrier: any = {};
  public locale: any = {};
  public airlinePage: any = {};
  public showHeroItems = false;
  public heroItems: any = {};
  public airlineUniqueSellingPoints: any = {};
  public airlineInfoCard: any = {};
  public showFlightRoutes = false;
  public flightRoutes: any = {};
  public accordianItems: any = [];
  public footerItems: any = [];
  constructor(private route: Router, private cmsService: CMSService) {}

  async ngOnInit(): Promise<void> {
    this.loading = true;
    // get the slug from the route
    this.path = this.route.url.split('/airlines/');
    this.slug = this.path[1];
    this.airlinePage = await this.cmsService.fetchAirlinePageBySlug(this.slug).then((data) => {
      return data;
    });

    if (!this.airlinePage) {
      parent.location.pathname = '/404';
    } else {
      // set the page data
      this.carrier = this.airlinePage?.carrier?.data?.attributes;
      this.locale = this.airlinePage?.locale?.data?.attributes;
      if (this.airlinePage?.promo_section?.header) {
        await this.setPromoRoutesItems();
        this.showFlightRoutes = true;
      } else if (this.airlinePage?.flight_routes_params?.header) {
        await this.setFlightRoutesItems();
        this.showFlightRoutes = true;
      } else {
        this.showFlightRoutes = false;
      }
      await this.cmsService.setSEOItemsInHead(
        this.airlinePage?.SEO,
        this.airlinePage?.Social,
        this.airlinePage?.locale.GENERAL_Twitter_handle
      );
      await this.setHeroItems();
      await this.setAirlineUniqueSellingPoints();
      await this.setAirlineInfoCard();
      await this.setAccoridianItems();
      await this.setFooterItems();
      this.loading = false;
    }
  }

  toggleSearch() {
    this.searchExpanded = !this.searchExpanded;
  }

  async setHeroItems() {
    this.heroItems = {
      type: 'airline',
      header: this.airlinePage.hero_section?.header || '',
      carrier: this.airlinePage?.carrier?.data?.attributes?.GENERAL_Name || '',
      imageURL: this.airlinePage?.hero_section?.hero_image?.data?.attributes?.url || '',
    };
    this.showHeroItems = true;
  }

  async setAirlineUniqueSellingPoints() {
    this.airlineUniqueSellingPoints = {
      imageURL: this.airlinePage?.unique_selling_points[0]?.image?.data?.attributes?.url || '',
      points: this.airlinePage?.unique_selling_points || [],
    };
  }

  async setAirlineInfoCard() {
    this.airlineInfoCard = {
      imageURL: this.airlinePage?.hero_section?.hero_image?.data?.attributes?.url || '',
      logoURL: this.carrier?.GENERAL_Logo?.data?.attributes?.url || '',
      items: [
        {
          header: 'IATA CODE',
          text: this.carrier?.GENERAL_Code || 'None',
        },
        {
          header: 'HUB AIRPORT',
          text: this.carrier?.DETAILS_Hub_airport || 'None',
        },
        {
          header: 'INFLIGHT MAGAZINE',
          text: this.carrier?.DETAILS_Inflight_magazine || 'None',
        },
        {
          header: 'LOYALTY PROGRAM',
          text: this.carrier?.DETAILS_Loyalty_program || 'None',
        },
        {
          header: 'ALLIANCE',
          text: this.carrier?.DETAILS_Alliance || 'None',
        },
      ],
    };
  }

  async setFlightRoutesItems() {
    const routes = this.airlinePage?.flight_routes_params || null;
    let flightRoutes = await this.cmsService.fetchAirlineFlightRoutesFromParams(routes);
    // sorting flight routes by price low to high
    if (flightRoutes && flightRoutes.length > 0) {
      flightRoutes = flightRoutes.sort(
        (a: any, b: any) => parseFloat(a.min_price_display) - parseFloat(b.min_price_display)
      );
    }
    this.flightRoutes = {
      header:
        this.airlinePage?.flight_routes_params?.header ||
        `Popular Flights with ${this.airlinePage.carrier?.data?.attributes?.GENERAL_Name}`,
      subHeader:
        this.airlinePage?.flight_routes_params?.subheader ||
        '* Please note that the prices are subject to availability and block out dates do apply over peak season',
      routes: flightRoutes || [],
      headerImageURL: this.airlinePage?.hero_section?.hero_image?.data?.attributes?.url || '',
    };
  }

  async setPromoRoutesItems() {
    // first check the end date to see if the promo is still valid
    var endDate = this.airlinePage?.promo_section?.promo_end_date || null;
    // replace the - with / for the date to be valid
    endDate = endDate.replace(/-/g, '/');
    // swop the year and day around to be in the correct format
    endDate = endDate.split('/');
    endDate = endDate[2] + '/' + endDate[1] + '/' + endDate[0];
    var endTime = this.airlinePage?.promo_section?.promo_end_time || null;
    const promoTimeStamp = endDate + ' ' + endTime;
    const promoEpoch = moment(promoTimeStamp, 'DD/MM/YYYY HH:mm').valueOf();
    const currentDate = moment().format('DD/MM/YYYY HH:mm');
    const currentDateEpoch = moment(currentDate, 'DD/MM/YYYY HH:mm').valueOf();
    if (promoEpoch < currentDateEpoch) {
      this.flightRoutes = {
        promoActive: false,
        header: 'Sorry this promotion has expired',
        routes: [],
      };
      // check if Flight Routes are active, if they are setFlightRoutesItems
      if (this.airlinePage.flight_routes_params?.header) {
        await this.setFlightRoutesItems();
      }
      return;
    }

    // then fetch the routes from the promo section
    const routes = this.airlinePage?.promo_section?.routes || null;
    const carrierCode = this.carrier?.GENERAL_Code || null;
    const currency = this.locale?.GENERAL_display_currency || null;
    const departureCountry = this.locale?.GENERAL_region || null;
    // const routes = this.airlinePage?.flight_routes_params || null;
    var flightRoutes = await this.cmsService.fetchAirlinePromoRoutesFromParams(
      routes,
      carrierCode,
      currency,
      departureCountry
    );
    // add the old price from the routes to the new flightRoutes
    flightRoutes.forEach((route: any) => {
      const oldRoute = this.airlinePage?.promo_section?.routes?.find(
        (oldRoute: any) =>
          oldRoute.destination_code === route.destination_code && oldRoute.origin_code === route.departure_code
      );
      if (oldRoute) {
        route.new_price = oldRoute.new_price;
      }
    });
    // sorting flight routes by price low to high
    if (flightRoutes && flightRoutes.length > 0) {
      flightRoutes = flightRoutes.sort(
        (a: any, b: any) => parseFloat(a.min_price_display) - parseFloat(b.min_price_display)
      );
    }
    this.flightRoutes = {
      promoActive: true,
      header:
        this.airlinePage?.promo_section?.header ||
        `Popular Flights with ${this.airlinePage.carrier?.data?.attributes?.GENERAL_Name}`,
      subHeader:
        this.airlinePage?.promo_section?.subheader ||
        '* Please note that the prices are subject to availability and block out dates do apply over peak season',
      routes: flightRoutes || [],
      headerImageURL: this.airlinePage?.hero_section?.hero_image?.data?.attributes?.url || '',
      terms: this.airlinePage?.promo_section?.terms_n_conditions || '',
      salePeriod: moment(endDate).format('MMM D, YYYY'),
      startDate: this.airlinePage?.promo_section?.promo_start_date || '',
      endDate: this.airlinePage?.promo_section?.promo_end_date || '',
      startTime: this.airlinePage?.promo_section?.promo_start_time || '',
      endTime: this.airlinePage?.promo_section?.promo_end_time || '',
      departurePeriod: this.airlinePage?.promo_section?.departure_period || '',
      returnPeriod: this.airlinePage?.promo_section?.return_period || '',
    };
  }

  async setAccoridianItems() {
    this.accordianItems = [
      {
        header: this.airlinePage.about_heading,
        content: this.airlinePage.Airline_info_about,
        expanded: false,
      },
      {
        header: this.airlinePage.baggage_heading,
        content: this.airlinePage.Airline_info_baggage,
        expanded: false,
      },
      {
        header: this.airlinePage.check_in_heading,
        content: this.airlinePage.Airline_info_check_in,
        expanded: false,
      },
      {
        header: this.airlinePage.on_board_heading,
        content: this.airlinePage.Airline_info_on_board,
        expanded: false,
      },
      {
        header: this.airlinePage.destinations_heading,
        content: this.airlinePage.Airline_info_destinations,
        expanded: false,
      },
    ];
  }

  async setFooterItems() {
    this.airlinePage.locale?.data.attributes.footer_sections?.forEach((footerSection: any) => {
      this.footerItems.push({
        header: footerSection.heading,
        links: footerSection.footer_links,
      });
    });
  }
}
