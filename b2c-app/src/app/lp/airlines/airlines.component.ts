import { CMSService } from './../cms.service';
import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'lp-airlines',
  templateUrl: './airlines.component.html',
  styleUrls: ['./airlines.component.scss'],
})
export class AirlinesComponent implements OnInit {
  public loading = true;
  public airlinesListPage: any;
  public airlineListPageBySlug: any;
  public airlineData: any;
  public searchExpanded = false;
  public countryCode: any = '';
  public carrier: any = {};
  public locale: any = {};
  public heroItems: any = {};
  public footerItems: any = [];
  public page: number = 1;
  public pageCount: number = 0;
  public pagesTotal: number = 0;
  private isBrowser: boolean;

  constructor(private CMSService: CMSService, @Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  async ngOnInit(): Promise<void> {
    if(!this.isBrowser) return;
    this.loading = true;
    // CMS service fetch airlines list page data
    this.airlineListPageBySlug = await this.CMSService.fetchAirlinePageBySlug('airline-list', 'list-page').then((data) => {
      return data;
    });
    this.airlineData = await this.CMSService.fetchAirlineListPage().then((data) => {
      return data;
    });
    this.airlinesListPage = this.airlineData?.data;

    if (this.airlineListPageBySlug) {
      await this.CMSService.setSEOItemsInHead(
        this.airlineListPageBySlug.SEO,
        this.airlineListPageBySlug.Social,
        '@Travelstart',
      );
    }
    this.pageCount = this.airlineData?.meta?.pagination?.pageCount;
    this.pagesTotal = this.airlineData?.meta?.pagination?.total;
    if (this.page <= this.pageCount) {
      await this.loadMore();
    }
    // filter out the 'airline-list' page by slug
    this.airlinesListPage = this.airlinesListPage?.filter((item: any) => item.attributes.GENERAL_slug !== 'airline-list');
    await this.setHeroItems();
    await this.setFooterItems();
    this.loading = false;
    // });
  }

  async loadMore(): Promise<void> {
    // this.loading = true;
    this.page = this.page + 1;
    // If the page is less than the page count, load more
    if (this.page <= this.pageCount) {
      await this.nextPage(this.page);
    }
  }

  async nextPage(page: number): Promise<void> {
    var airlineData: any = await this.CMSService.fetchAirlineListPage(page).then((data) => {
      return data;
    });
    this.airlinesListPage = this.airlinesListPage.concat(airlineData.data);
  }

  filterAirline() {
    if(!this.isBrowser) return;
    // Declare variables
    var input: any, filter: any, ul: any, li: any, a: any, i: any, txtValue: any;
    input = document.getElementById('myInput');
    filter = input.value.toUpperCase();
    ul = document.getElementById('myUL');
    li = ul.getElementsByTagName('li');

    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < li.length; i++) {
      a = li[i].getElementsByTagName('a')[0];
      txtValue = a.textContent || a.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        li[i].style.display = '';
      } else {
        li[i].style.display = 'none';
      }
    }
  }

  toggleSearch() {
    this.searchExpanded = !this.searchExpanded;
  }

  async setHeroItems() {
    this.heroItems = {
      type: 'airline',
      header: 'Compare & Book Cheap Airline Tickets',
      imageURL: this.airlinesListPage[3]?.attributes.hero_section?.hero_image?.data?.attributes?.url || '',
    };
  }

  async setFooterItems() {
    this.airlinesListPage[0]?.attributes.locale?.data.attributes.footer_sections?.forEach((footerSection: any) => {
      this.footerItems.push({
        header: footerSection.heading,
        links: footerSection.footer_links,
      });
    });
  }
}


