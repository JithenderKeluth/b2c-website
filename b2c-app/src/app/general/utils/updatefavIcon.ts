import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export function updateFavIcon(tsCountry: any, platformId: Object): void {
  if (!isPlatformBrowser(platformId)) {
    return; // Exit early if not running in the browser
  }

  let iconName: any = null;

  if (tsCountry !== 'MM' && tsCountry !== 'FS') {
    iconName = 'ZA';
  } else {
    iconName = `${tsCountry}`;
  }

  const link: HTMLLinkElement = document.createElement('link');
  link.type = 'image/x-icon';
  link.rel = 'shortcut icon';
  link.href = `assets/favIcons/${iconName}.ico`;

  const head = document.getElementsByTagName('head')[0];
  if (head) {
    head.appendChild(link);
  }
}
