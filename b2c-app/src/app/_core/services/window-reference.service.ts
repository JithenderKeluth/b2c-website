import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class WindowReferenceService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  get nativeWindow(): Window | object {
    return isPlatformBrowser(this.platformId) ? window : {};
  }
}
