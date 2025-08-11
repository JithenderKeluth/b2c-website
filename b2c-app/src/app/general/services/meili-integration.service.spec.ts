import { TestBed } from '@angular/core/testing';

import { MeiliIntegrationService } from './meili-integration.service';

describe('MeiliIntegrationService', () => {
  let service: MeiliIntegrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MeiliIntegrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
