import { Injectable, Renderer2, RendererFactory2, NgZone, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class GtmService {
  private renderer: Renderer2;
  private isBrowser: boolean;

  constructor(rendererFactory: RendererFactory2, private zone: NgZone, @Inject(PLATFORM_ID) private platformId: Object) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  public addGtmScript(containerId: string): void {
    if (!this.isBrowser) return;
    if (!containerId) {
      console.error('GTM container ID is required.');
      return;
    }

    // Check if the script already exists
    const existingScript = document.querySelector(`script[src*="googletagmanager.com/gtm.js?id=${containerId}"]`);
    if (existingScript) return;

    this.zone.runOutsideAngular(() => {
      // Add GTM script to head
      const script = this.renderer.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.defer = true;
      script.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${containerId}');
      `;
      this.renderer.appendChild(document.head, script);

      // Add noscript to body
      const noscript = this.renderer.createElement('noscript');
      const iframe = this.renderer.createElement('iframe');
      this.renderer.setAttribute(iframe, 'src', `https://www.googletagmanager.com/ns.html?id=${containerId}`);
      this.renderer.setAttribute(iframe, 'height', '0');
      this.renderer.setAttribute(iframe, 'width', '0');
      this.renderer.setAttribute(iframe, 'style', 'display:none;visibility:hidden');
      this.renderer.appendChild(noscript, iframe);
      this.renderer.insertBefore(document.body, noscript, document.body.firstChild);
    });
  }
}
