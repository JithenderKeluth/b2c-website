import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ConfirmationComponent } from '../../app/payment/confirmation/confirmation.component';

export interface ComponentCanDeactivate {
  canDeactivate(): boolean | Observable<boolean>;
}

export const CanDeactivateState = {
  defendAgainstBrowserBackButton: false,
};

@Injectable()
export class CanDeactiveGuard implements CanDeactivate<ComponentCanDeactivate> {
  constructor(readonly matDialog: MatDialog) {}

  canDeactivate(component: ComponentCanDeactivate): boolean | Observable<boolean> {
    return (
      component.canDeactivate() ||
      this.matDialog
        .open<ConfirmationComponent, void, boolean>(ConfirmationComponent, {
          disableClose: true,
        })
        .afterClosed()
        .pipe(
          tap((confirmed) => {
            if (!confirmed && CanDeactivateState.defendAgainstBrowserBackButton) {
              history.pushState(null, '', '');
            }
          })
        )
    );
  }
}
