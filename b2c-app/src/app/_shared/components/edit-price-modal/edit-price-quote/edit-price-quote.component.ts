import { Component, EventEmitter, OnInit, Input, ViewChild, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SearchService } from '@app/flights/service/search.service';
import html2canvas from 'html2canvas';
import jspdf from 'jspdf';

@Component({
  selector: 'app-edit-price-quote',
  templateUrl: './edit-price-quote.component.html',
  styleUrls: ['./edit-price-quote.component.scss'],
})
export class EditPriceQuoteComponent implements OnInit {
  @ViewChild('priceNote') priceNote: any;
  RETURN: string = 'return';
  MULTI: string = 'multi';
  ONE_WAY: string = 'oneway';
  ARRAY_ZERO_INDEX = 0;
  ARRAY_FIRST_INDEX = 1;
  currency: any;
  date = new Date();
  @Input() displayDiscountonQuote: boolean;
  @Input() quoteNumber: string;
  @Input() itinerary: any;
  @Input() tripType: string;
  @Input() updatedPrice: any;
  @Output() invoiceDownloadEvent: EventEmitter<any> = new EventEmitter<any>();
  agencyInfo: any = null;
  constructor(private searchService: SearchService,
    public domSanitizer : DomSanitizer
  ) {
   
  }

  ngOnInit(): void {
    this.currency = this.itinerary.currencyCode;
    this.getAgencyInfo();
     setTimeout(() => {
       this.downloadQuote();
     }, 5000);
  }

  getFirstOdoFirstSegment() {
    return this.itinerary.odoList[this.ARRAY_ZERO_INDEX].segments[this.ARRAY_ZERO_INDEX];
  }

  getSecondOdoFirstSegment() {
    return this.itinerary.odoList[this.ARRAY_FIRST_INDEX].segments[this.ARRAY_ZERO_INDEX];
  }

  getSecondOdoSegments() {
    return this.itinerary.odoList[this.ARRAY_FIRST_INDEX].segments;
  }

  downloadQuote() {
    const data:any = document.getElementById('bookingQuote');
    html2canvas(data).then((canvas) => {
      // Generated PDF
      let imgData = canvas.toDataURL('image/jpeg', 1.0);
      let imgWidth = 200;
      let pageHeight = 295;
      let imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let doc = new jspdf('p', 'mm', 'a4');
      let position = 10;
      doc.addImage(imgData, 'JPEG', 5, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, 'JPEG', 5, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      doc.save(`Quote-${this.quoteNumber}.pdf`);
    });
    this.invoiceDownloadEvent.emit();
  }
  /**To display user logo and name  */
  getAgencyInfo() {
    this.searchService.getB2BAgencyInfo().subscribe((res: any) => {
      if(res.success){
        this.agencyInfo = res?.data;
        this.agencyInfo['logo'] = this.agencyInfo?.logo
          ? this.domSanitizer.bypassSecurityTrustUrl(
              this.agencyInfo?.logo.replace('data:binary', 'data:image/png')
            )
          : null;
      }
    });
  }
  
}
