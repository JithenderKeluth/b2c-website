import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { Logger } from './../_core';
import { CredentialsService } from './credentials.service';

const log = new Logger('AuthenticationGuard');

@Injectable({
  providedIn: 'root',
})
export class AuthenticationGuard {
  constructor(
    private router: Router,
    private credentialsService: CredentialsService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Bypass auth check if rendering on the server
    if (isPlatformServer(this.platformId)) {
      log.debug('SSR detected, skipping auth check.');
      return true;
    }

    if (this.credentialsService.isAuthenticated()) {
      return true;
    }

    log.debug('Not authenticated, redirecting and adding redirect url...');
    this.router.navigate(['/'], { queryParams: { redirect: state.url }, replaceUrl: true });
    return false;
  }
}
