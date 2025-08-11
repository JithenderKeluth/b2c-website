import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UiStateService {
  private _showMask = new BehaviorSubject<boolean>(false);
  showMask$ = this._showMask.asObservable();

  setShowMask(val: boolean) {
    this._showMask.next(val);
  }
} 