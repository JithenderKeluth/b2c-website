import { Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { HttpClient } from '@angular/common/http';
import {
  PROXY_SERVER_PATH,  
  PROXY_BUTTERCMS_MEMBER_DEALS
} from './../../general/services/api/api-paths';


@Component({
  selector: 'app-member-deals-benefits',
  templateUrl: './member-deals-benefits.component.html',
  styleUrls: ['./member-deals-benefits.component.scss','../../_shared/components/home-page-banners/home-page-banners.component.scss']
})
// b2c-app/src/app/_shared/components/home-page-banners/home-page-banners.component.scss
export class MemberDealsBenefitsComponent implements OnInit {
  butterCollectionTofetch: string;
  butterParams: any;
  carouselItems: any;
  memberDeals: any = [];
  butterCollectionName: string;
  img_width = 363;
  countryValue: string;
  owlOptions: OwlOptions = {
    animateOut: 'slideOutDown',
    animateIn: 'flipInX',
    smartSpeed: 1150,
    autoWidth: true,
    lazyLoad: true,
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    autoplay: true,
    dots: false,
    navSpeed: 300,
    navText: ["<div class='nav-btn prev-slide'></div>", "<div class='nav-btn next-slide'></div>"],
    responsive: {
      0: {
        items: 1,
      },
      400: {
        items: 1,
      },
      577:{
        items: 2,
      },
      767: {
        items: 2,
      },
      1024: {
        items: 3,
      },
    },
    nav: true,
  };
  constructor( private httpClient: HttpClient) {
  }


  ngOnInit(): void {
    this.loadMemberDeals();
  }
  loadMemberDeals(): void {
    const url = `${PROXY_SERVER_PATH}${PROXY_BUTTERCMS_MEMBER_DEALS}`;
    const payload = {
      page: 1,
      page_size: 10,
      locale: 'en-za'
    };
    console.log("---------load member deals---->>>");
  this.httpClient.post(url, payload).subscribe({
    next: (res: any) => {
      this.memberDeals = Array.isArray(res?.data) ? res.data : [];
    },
    error: (error) => {
      console.error('Error fetching member deals from server:', error);
    }
  });
  }
}
