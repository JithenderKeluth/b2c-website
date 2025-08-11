let isBrowserPlatform = typeof window !== 'undefined';

function getWindow(): Window | undefined {
  return isBrowserPlatform ? window : undefined;
}

export function setPlatform(isBrowser: boolean) {
  isBrowserPlatform = isBrowser;
}

/**
 * Check if the current site is a white-labeled Mastercard site.
 */
export function isWhitelabeledSite(): boolean {
  const win = getWindow();
  if (!win) return false;
  const url = win.location.href;
  const hostname = win.location.hostname;
  return url.includes('cpysource=mastercardza') || hostname.includes('mastercard.travelstart.co.za');
}

/**
 * Determines if the widget is running inside an iframe.
 */
export function isIframeWidget(isIframe: boolean): boolean {
  const win = getWindow();
  return win ? win.self === win.top && !isIframe : false;
}

/**
 * Sends a postMessage to the parent window to navigate to the B2B back page.
 */
export function navigateToB2B_BackPage(): void {
  const win = getWindow();
  if (win?.parent) {
    win.parent.postMessage({ type: 'navigateToBackPage' }, '*');
  }
}
