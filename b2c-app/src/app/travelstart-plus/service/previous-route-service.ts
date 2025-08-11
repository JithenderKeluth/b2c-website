// previous-route.service.ts
import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PreviousRouteService {
  private previousUrl: string | null = null;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe((event: NavigationStart) => {
        this.previousUrl = this.router.url;
      });
  }

  public getPreviousUrl(): string | null {
    return this.previousUrl;
  }
}
