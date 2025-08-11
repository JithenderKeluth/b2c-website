// globals.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject, Observable } from 'rxjs';

@Injectable()
export class responsiveService {
  private isMobile = new Subject<boolean>();
  public screenWidth: string;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.checkWidth();
  }

  onMobileChange(status: boolean) {
    this.isMobile.next(status);
  }

  getMobileStatus(): Observable<boolean> {
    return this.isMobile.asObservable();
  }

  public checkWidth() {
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width <= 768) {
        this.screenWidth = 'sm';
        this.onMobileChange(true);
      } else if (width > 768 && width <= 992) {
        this.screenWidth = 'md';
        this.onMobileChange(true);
      } else {
        this.screenWidth = 'lg';
        this.onMobileChange(false);
      }
    } else {
      // SSR fallback - no window available
      this.screenWidth = 'lg';  // Or 'server', based on your preference
      this.onMobileChange(false);  // Assume not mobile in SSR
    }
  }
}
