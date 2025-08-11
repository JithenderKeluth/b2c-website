import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { environment } from '../../environments/environment';
import { Title, Meta } from '@angular/platform-browser';
import axios from 'axios';
import { I18nService } from '@app/i18n/i18n.service';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class CMSService {
  private isBrowser: boolean;
  constructor(
    private i18nService: I18nService,
    private titleService: Title,
    private metaService: Meta,
    private storage: UniversalStorageService,
    @Inject(DOCUMENT) private doc: any,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  async getLocale() {
    if (this.storage.getItem('country-language', 'session')) {
      let countryVal = this.storage.getItem('country-language', 'session').split('-')[1];
      // for testing LPs, just enable the line below to override the country
      // countryVal = 'ZA'
      return countryVal;
    } else { 
      let countryVal2 = this.i18nService.language.split('-')[1];
      // countryVal2 = 'ZA'
      return countryVal2;
    }
  }

  /**
   * STRAPI - API calls
   * Fetch Airline Page by slug
   * @param slug to retrieve
   * @return Airline Page or null
   */

  public async fetchAirlineListPage(page?: number): Promise<void> {
    if (!this.isBrowser) return;
    const locale = await this.getLocale();
    var url = '';
    if (page && page > 1) {
      url = `${environment.strapiUrl}/airline-pages?pagination[page]=${page}&pagination[pageSize]=100&sort[1]=GENERAL_slug:asc&filters[locale][GENERAL_region]=${locale}&populate=locale,domains_identifier,carrier.GENERAL_Logo,locale.footer_sections.footer_links,hero_section.hero_image,SEO,Social`;
    } else {
      url = `${environment.strapiUrl}/airline-pages?pagination[page]=1&pagination[pageSize]=100&sort[1]=GENERAL_slug:asc&filters[locale][GENERAL_region]=${locale}&populate=locale,domains_identifier,carrier.GENERAL_Logo,locale.footer_sections.footer_links,hero_section.hero_image,SEO,Social`;
    }
    return await axios
      .get(url)
      .then((response: any) => {
        // do error handling for no results and multiple results
        if (response.data.data.length === 0) {
          return null;
        }
        const res = response.data;
        return res;
      })
      .catch((error: any) => { 
        return null;
      });
  }

  public async fetchAirlinePageBySlug(slug: string, pageType?: string): Promise<void> {
    if (!this.isBrowser) return;
    const locale = await this.getLocale();
    var url = '';
    if (pageType === 'list-page') {
      url = `${environment.strapiUrl}/airline-pages?filters[GENERAL_slug]=${slug}&filters[locale][GENERAL_region]=${locale}&populate=locale,domains_identifier,locale.footer_sections.footer_links,hero_section.hero_image,SEO,Social`;
    } else {
      url = `${environment.strapiUrl}/airline-pages?filters[GENERAL_slug]=${slug}&filters[locale][GENERAL_region]=${locale}&populate=locale,domains_identifier,carrier.GENERAL_Logo,locale.footer_sections.footer_links,SEO,unique_selling_points.image,hero_section.hero_image,Social.social_image,flight_routes_params`;
    }
    return await axios
      .get(url)
      .then((response: any) => {
        // do error handling for no results and multiple results
        if (response.data.data.length === 0) {
          return null;
        }
        const res = response.data.data[0].attributes;
        return res;
      })
      .catch((error: any) => { 
        return null;
      });
  }

  /**
   * Other Pages to come here
   */

  /**
   * BIG QUERY - API calls
   * Big Query routes (for dynamic popular flights)
   */
  async fetchAirlineFlightRoutesFromParams(flight_routes_params: any): Promise<any> {
    if (!flight_routes_params) {
      return null;
    } 
    const url = `${environment.bigQueryUrl}${this.getAirlineURLParametersFromFlightRoutes(flight_routes_params)}`;
    const response = await axios
      .get(url)
      .then((response: any) => {
        return response.data.results;
      })
      .catch((error: any) => { 
        return null;
      });
    return response;
  }

  async fetchAirlinePromoRoutesFromParams(
    routes: any,
    carrier: any,
    currency: any,
    departCountryCode: any
  ): Promise<any> {
    if (!routes) {
      return null;
    }
    // for each route, map the origin_code and destination_code
    // i.e. JNB-CPT and add all the routes into an array
    // then pass the array into the URL
    // format the routes into a string separated by commas
    var formattedRoutes = '';
    var stringToAdd = '';
    var tripType = '';
    for (let i = 0; i < routes.length; i++) {
      stringToAdd = routes[i].origin_code + '-' + routes[i].destination_code;
      if (i === 0) {
        formattedRoutes = stringToAdd;
      } else {
        formattedRoutes = formattedRoutes + ',' + stringToAdd;
      }
      // get the trip type from the 1st route
      if (i === 0) {
        tripType = routes[i].trip_type;
      }
    }
    const url = `${environment.bigQueryUrl}${this.getAirlineURLParametersFromPromoRoutes(
      formattedRoutes,
      carrier,
      currency,
      departCountryCode,
      tripType
    )}`;
    const response = await axios
      .get(url)
      .then((response: any) => {
        return response.data.results;
      })
      .catch((error: any) => { 
        return null;
      });
    return response;
  }

  /*
   * SEO Utils
   * Sets SEO tags for the page (title, description, canonical URL, etc.)
   */
  async setSEOItemsInHead(seo: any, social: any, twitterFromLocale: any) {
    if (!this.isBrowser) return;
    this.createLinkForCanonicalURL();
    // Update Title & Meta tags
    this.titleService.setTitle(seo.page_title || 'Travelstart');
    if (seo.meta_description) {
      this.metaService.updateTag({
        name: 'description',
        content: seo.meta_description || 'Book Cheap flights with Travelstart',
      });
    }
    if (seo.meta_robots) {
      this.metaService.updateTag({
        name: 'robots',
        content: seo.meta_robots || '',
      });
    }
    if (seo.keywords) {
      this.metaService.updateTag({
        name: 'keywords',
        content:
          seo.keywords ||
          'travelstart, book cheap flights, book cheap flights with travelstart, flights, cheap flights',
      });
    }
    // Set Social Meta tags
    this.metaService.addTags([
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: social.social_title || '' },
      { property: 'og:image', content: social.social_image || '' },
      { property: 'og:description', content: social.social_description || '' },
      { property: 'og:url', content: window.location.href || '' },
      { property: 'twitter:card', content: 'summary' },
      { property: 'twitter:title', content: social.social_title || '' },
      { property: 'twitter:image', content: social.social_image || '' },
      { property: 'twitter:description', content: social.social_description || '' },
      { property: 'twitter:site', content: twitterFromLocale || '@travelstart' },
    ]);
    if (seo.schema_markup) {
      this.loadSchemaScript(seo.schema_markup);
    }
  }

  createLinkForCanonicalURL() {
    if (!this.isBrowser) return;
    // first remove the existing canonical link
    const existingCanonicalLink = this.doc.querySelector('link[rel="canonical"]');
    if (existingCanonicalLink) {
      this.doc.head.removeChild(existingCanonicalLink);
    }
    // then add the new canonical link
    let link: HTMLLinkElement = this.doc.createElement('link');
    link.setAttribute('rel', 'canonical');
    this.doc.head.appendChild(link);
    link.setAttribute('href', window.location.href || '');
  }

  loadSchemaScript(markup: any) {
    if (!this.isBrowser) return;
    // creates the script tag
    let node = document.createElement('script');
    node.src = '';
    node.type = 'application/ld+json';
    node.async = true;
    node.charset = 'utf-8';
    node.innerHTML = markup || '';
    // append to head of document
    document.getElementsByTagName('head')[0].appendChild(node);
  }

  getURLParameters() {
    if (!this.isBrowser) return;
    return window.location.search.replace('?', '') || '';
  }

  followLink(path: string, search?: boolean) {
    if (!this.isBrowser) return;
    let url = '';
    if (search) {
      url = `${path}${this.getURLParameters() ? '&' + this.getURLParameters() : ''}`;
    } else {
      url = `${path}${this.getURLParameters() ? '?' + this.getURLParameters() : ''}`;
    } 
    window.location.href = url;
  }

  /*
   * CMS Utils
   * Getters for CMS data
   */

  // For Airline Pages: Flight Routes
  getAirlineURLParametersFromFlightRoutes(params: any) {
    var urlParams = '';
    if (params.airline_code) {
      urlParams += `&airline_code=${params.airline_code}`;
    }
    if (params.departure_country) {
      urlParams += `&departure_country=${params.departure_country}`;
    }
    if (params.display_currency_code) {
      urlParams += `&display_currency_code=${params.display_currency_code}`;
    }
    if (params.is_oneway) {
      urlParams += `&is_roundtrip=false`;
    } else if (params.is_roundtrip) {
      urlParams += `&is_roundtrip=true`;
    }
    if (params.routes) {
      urlParams += `&routes=${params.routes}`;
    } else if (params.destination) {
      urlParams += `&destination=${params.destination}`;
    }
    if (params.regionality) {
      urlParams += `&regionality=${params.regionality}`;
    }
    return urlParams;
  }

  // For Airline Pages: Promo Routes
  getAirlineURLParametersFromPromoRoutes(routes: any, carrier: any, currency: any, country: any, tripType: any) {
    var urlParams = '';
    if (carrier) {
      urlParams += `&airline_code=${carrier}`;
    }
    if (country) {
      urlParams += `&departure_country=${country}`;
    }
    if (currency) {
      urlParams += `&display_currency_code=${currency}`;
    }
    if (tripType === 'One-way') {
      urlParams += `&is_roundtrip=false`;
    } else if (tripType === 'Return') {
      urlParams += `&is_roundtrip=true`;
    }
    if (routes) {
      urlParams += `&routes=${routes}`;
    }
    return urlParams;
  }
}
