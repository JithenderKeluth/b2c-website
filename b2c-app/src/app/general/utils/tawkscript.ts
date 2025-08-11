import { formatDate } from '@angular/common';
import { TAWK_NG_API, TAWK_ZA_API } from '../services/api/api-paths';

export function initTawkScript(domain: string, bookAgent?: any) {
  const tawkUrl: any = domain == 'NG' ? `${TAWK_NG_API}` : `${TAWK_ZA_API}`;
  if(typeof document === 'undefined' || typeof window === 'undefined') return;
  const script = `
    var Tawk_API = Tawk_API || null, Tawk_LoadStart = new Date();
          if(${bookAgent} || Tawk_API == null){
            (function () {
              var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
              s1.async = true;
              s1.src = '${tawkUrl}';
              s1.charset = 'UTF-8';
              s1.id = 'tawkscript'
              s1.setAttribute('crossorigin', '*');
              s1.setAttribute('id','tawkscript')
              s0.parentNode.insertBefore(s1, s0);
            })()
            if(Tawk_API){
              window.Tawk_API.showWidget();
            }
          }
          else if(${!bookAgent} && Tawk_API != null){
              window.Tawk_API.maximize();
          }

    `;
  if (!bookAgent) {
    let tags = document.getElementsByTagName('script');
    for (let i = tags.length; i >= 0; i--) {
      //search backwards within nodelist for matching elements to remove
      if (tags[i] && tags[i].getAttribute('id') != null && tags[i].getAttribute('id') == 'tawkscript')
        tags[i].parentNode.removeChild(tags[i]); //remove element by calling parentNode.removeChild()
    }
  }
  const el = document.createElement('script');
  el.text = script;
  el.id = 'tawkscript';
  document.body.appendChild(el);
}

/**loads a widget to book with an agent in srp page*/
export function freshWorkswidget(deptDate: string, arrDate?: string) {
  if(typeof document === 'undefined' || typeof window === 'undefined') return;
  let flightSearchData = JSON.parse(sessionStorage.getItem('flightsearchInfo'));
  let deptCity = flightSearchData.itineraries[0].dept_city.iata;
  let arrCity: string;
  let arrivalDate: string;
  let freshworkwidget: any;
  let departureDate = formatDate(deptDate, 'dd-MM-yyyy', 'en_US');
  if (flightSearchData.tripType == 'return') {
    arrivalDate = formatDate(arrDate, 'dd-MM-yyyy', 'en_US');
  }
  if (flightSearchData.tripType !== 'multi') {
    arrCity = flightSearchData.itineraries[0].arr_city.iata;
  } else {
    arrCity = flightSearchData.itineraries[flightSearchData.itineraries.length - 1].arr_city.iata;
  }

  if (flightSearchData.tripType !== 'return') {
    freshworkwidget = `function filiform(){
      FreshworksWidget('prefill', 'ticketForm', {
      subject: 'Help with booking',
      description: 'I want to fly from ${deptCity} to ${arrCity} on ${departureDate}. Please help with the booking',
      priority: 1,
      group_id: 62000168082});
        }
        filiform();
        `;
  } else {
    freshworkwidget = `function filiform(){
      FreshworksWidget('prefill', 'ticketForm', {
      subject: 'Help with booking',
      description: 'I want to fly from ${deptCity} to ${arrCity} on ${departureDate} and return ${arrivalDate}. Please help with the booking',
      priority: 1,
      group_id: 62000168082});
        }
        filiform();
        `;
  }

  const freshWidget = `
    FreshworksWidget('hide', 'launcher');
    FreshworksWidget('hide', 'ticketForm', ['subject']);
    FreshworksWidget('open');
  `;
  const widget = document.createElement('script');
  const fw = document.createElement('script');
  widget.text = freshworkwidget;
  fw.text = freshWidget;
  document.body.appendChild(widget);
  document.body.appendChild(fw);
  let wdg = document.getElementById('freshworks-container');
  wdg.style.display = 'block';
}
/**
 * closes fresh desk widget
 */
export function closeFreshDeskWidget() {
  if(typeof document === 'undefined' || typeof window === 'undefined') return;
  let wdg = document.getElementById('freshworks-container');
  if (wdg) {
    wdg.style.display = 'none';
  }
}
