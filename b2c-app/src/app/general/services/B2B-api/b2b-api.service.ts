import { Injectable } from '@angular/core';
import {PERMISSIONS} from './role.constants';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
@Injectable({
  providedIn: 'root',
})
export class B2bApiService {
  constructor(private storage: UniversalStorageService) {}
  hasPermission(permission: number) {
    const user = this.getUser();
    return user ? user.permission.some((each: number) => each === permission) : false;
  }
  getUser() {
    return this.storage.getItem('b2bUser', 'session') ? JSON.parse(this.storage.getItem('b2bUser', 'session')) : null;
  }
  hasEditPricePermission() {
    return this.hasPermission(PERMISSIONS.editflightprice);
  }
  hasPermissionForReservedBookings() {
    return this.hasPermission(PERMISSIONS.HOLD_AND_PAY);
  }
}
