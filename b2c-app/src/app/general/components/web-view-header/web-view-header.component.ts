import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SearchService } from '@app/flights/service/search.service';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

@Component({
  selector: 'app-web-view-header',
  templateUrl: './web-view-header.component.html',
  styleUrls: ['./web-view-header.component.scss'],
})
export class WebViewHeaderComponent implements OnInit {
  enteredButton = false;
  isMatMenuOpen = false;
  public userName: any;

  constructor(private router: Router, private searchService: SearchService, private storage: UniversalStorageService) {}

  ngOnInit(): void {
    // Delay not recommended unless essential; consider if needed for timing purposes.
    setTimeout(() => {
      this.searchService.currentUserCredentials.subscribe((userCredentials: any) => {
        this.userName = userCredentials?.data?.firstName ?? this.getStoredUsername();
      });
    }, 1000);
  }

  private getStoredUsername(): string | null {
    const credentials = this.storage.getItem('credentials', 'session') || this.storage.getItem('credentials', 'local');
    return credentials ? JSON.parse(credentials)?.data?.firstName || null : null;
  }

  buttonEnter(trigger: any) {
    setTimeout(() => trigger.openMenu());
  }

  buttonLeave(trigger: any) {
    setTimeout(() => {
      if (!this.isMatMenuOpen) {
        trigger.closeMenu();
      }
      this.enteredButton = false;
    }, 100);
  }

  menuenter() {
    this.isMatMenuOpen = true;
  }

  menuLeave(trigger: any) {
    setTimeout(() => {
      this.isMatMenuOpen = this.enteredButton;
      if (!this.isMatMenuOpen) {
        trigger.closeMenu();
      }
    }, 80);
  }

  goToMyAccount() {
    this.router.navigate(['/my-account'], { queryParamsHandling: 'preserve' });
  }
}
