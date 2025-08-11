import { TestBed } from '@angular/core/testing';

import { ErrorMappingServiceService } from './error-mapping-service.service';

describe('ErrorMappingServiceService', () => {
  let service: ErrorMappingServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ErrorMappingServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
