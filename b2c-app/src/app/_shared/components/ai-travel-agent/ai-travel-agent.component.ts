import { IframeWidgetService } from '@app/general/services/iframe-widget.service';
import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { ApiService } from '../../../general/services/api/api.service';
import { Router } from '@angular/router';
import { I18nService } from '../../../i18n/i18n.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-ai-travel-agent',
  templateUrl: './ai-travel-agent.component.html',
  styleUrl: './ai-travel-agent.component.scss'
})
export class AiTravelAgentComponent implements OnInit {
  aI_TravelAgent_Data :any = null;
  domainCountry :any = null;
  private isBrowser: boolean;
  constructor(private apiService : ApiService,
    private router : Router,
    private i18nService:I18nService,
    private iframeWidgetService :IframeWidgetService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { 
    this.isBrowser = isPlatformBrowser(this.platformId);
  }
  ngOnInit(): void {
    this.domainCountry = this.apiService.extractCountryFromDomain();
    this.getAItravelAgentData();
  }
  navigateTo_AI_TravelAgent(){
    if (!this.isBrowser) return;
    const travel_AI_AgentLink = this.aI_TravelAgent_Data?.redirectLinks[this.domainCountry] ?? this.aI_TravelAgent_Data?.default_RedirectLink;
    window.open(travel_AI_AgentLink, '_blank');
  }
  /**To get list of allowed cpysource to display AI_travelAgentIcon */
  getAItravelAgentData(){
    this.i18nService.getAItravelAgentJSONData().subscribe((data:any)=>{
      if(data){
        this.aI_TravelAgent_Data = data;
      }
    })
  }
    /**here we are checking current domain is included or not in S3 allowed_domains List */
    isShowAItravelAgentIcon(){
      return Boolean(this.aI_TravelAgent_Data?.allowed_domains?.includes(this.domainCountry) && !this.router.url.includes('cpysource') && !this.iframeWidgetService.isB2BApp());
      /**If we want to consider cpysource then we can enable below code  
       * const isCpysourceAllowed = this.aI_TravelAgent_Data?.allowed_cpysources?.some((cpysource:any)=>this.router.url.includes(cpysource));
      return Boolean((this.apiService.extractCountryFromDomain() == 'ZA' && !this.router.url.includes('cpysource') ) || isCpysourceAllowed);
      */
    }
}
