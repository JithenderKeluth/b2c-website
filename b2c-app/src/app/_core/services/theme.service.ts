import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { THEMES } from '../config/theme.config';

export type Theme = 'default' | 'investec' | 'gigm' | 'clubhub' | 'momentum' | 'absa' | 'standardbank';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  currentTheme: Theme = 'default';

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.document.body.classList.add(this.currentTheme);
    }
  }

  setTheme(name: Theme = 'default') {
    if (!isPlatformBrowser(this.platformId)) return;

    const theme = THEMES[name];
    if (!theme) {
      console.warn(`Theme "${name}" not found in config.`);
      return;
    }

    // Safely update class on body
    this.document.body.classList.remove(this.currentTheme);
    this.document.body.classList.add(name);
    this.currentTheme = name;

    // Apply CSS variables
    Object.keys(theme).forEach((key) => {
      this.document.documentElement.style.setProperty(`--${key}`, theme[key]);
    });

    // Remove previous theme stylesheet
    const existingLink = this.document.getElementById('TenantCustomCss');
    if (existingLink) {
      existingLink.remove();
    }

    // Load new theme stylesheet
    const link = this.document.createElement('link');
    link.id = 'TenantCustomCss';
    link.rel = 'stylesheet';
    link.href = `/assets/css/${name}.css`; // absolute path is safer
    this.document.head.appendChild(link);
  }
}
