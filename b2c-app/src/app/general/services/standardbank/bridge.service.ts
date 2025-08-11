import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class BridgeService {
  private sessionIdSubject = new Subject<string>();
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      // Register global callback for native to JS communication
      (window as any).onSessionIdReceived = (data: string) => {
        console.log("onSessionIdReceived---", data);
        this.sessionIdSubject.next(data);
        return true;
      };

      (window as any).getSessionIdCallback = (data: string) => {
        console.log("getSessionIdCallback---", data);
        this.sessionIdSubject.next(data);
        return true;
      };
    }
  }

  // Detect iOS or Android
  private getPlatform(): 'ios' | 'android' | 'unknown' {
    if (!this.isBrowser) return 'unknown';

    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

    if (/android/i.test(userAgent)) {
      return 'android';
    }

    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      return 'ios';
    }

    return 'unknown';
  }

  requestSessionId(): void {
    if (!this.isBrowser) return;

    const platform = this.getPlatform();
    console.log("requestSessionId---", platform);

    if (platform === 'ios' && (window as any).webkit?.messageHandlers?.SessionIdBridge) {
      (window as any).webkit.messageHandlers.SessionIdBridge.postMessage(null);
    } else if (platform === 'android' && (window as any).SessionIdBridge?.postMessage) {
      (window as any).SessionIdBridge.postMessage(null);
    } else {
      console.warn('Native bridge not available for requestSessionId');
    }
  }

  getSessionId(): Observable<string> {
    return this.sessionIdSubject.asObservable();
  }

  tearDownWebView(): void {
    if (!this.isBrowser) return;

    const platform = this.getPlatform();
    console.log("tearDownWebView--->>>", platform);

    if (platform === 'ios' && (window as any).webkit?.messageHandlers?.TearDownBridge) {
      (window as any).webkit.messageHandlers.TearDownBridge.postMessage({ action: 'tearDown' });
    } else if (platform === 'android' && (window as any).TearDownBridge?.postMessage) {
      (window as any).TearDownBridge.postMessage(JSON.stringify({ action: 'tearDown' }));
    } else {
      console.warn('Native bridge not available for tearDownWebView');
    }
  }

  isRunningInWebView(): boolean {
    if (!this.isBrowser) return false;

    const userAgent = navigator.userAgent || navigator.vendor;
    const isAndroidWebView = /wv/.test(userAgent) || (/Android/.test(userAgent) && /Version\/[\d.]+/.test(userAgent));
    const isIOSWebView = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(userAgent);

    return isAndroidWebView || isIOSWebView;
  }
}
