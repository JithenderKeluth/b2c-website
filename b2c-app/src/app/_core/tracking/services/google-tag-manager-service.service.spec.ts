import { TestBed } from '@angular/core/testing';

import { GoogleTagManagerServiceService } from './google-tag-manager-service.service';

describe('GoogleTagManagerServiceService', () => {
  let service: GoogleTagManagerServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoogleTagManagerServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
