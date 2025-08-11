import { TestBed } from '@angular/core/testing';

import { B2bApiService } from './b2b-api.service';

describe('B2bApiService', () => {
  let service: B2bApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(B2bApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
