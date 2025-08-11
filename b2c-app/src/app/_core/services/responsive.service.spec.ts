import { TestBed } from '@angular/core/testing';

import { responsiveService } from './responsive.service';

describe('ResponsiveService', () => {
  let service: responsiveService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(responsiveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
