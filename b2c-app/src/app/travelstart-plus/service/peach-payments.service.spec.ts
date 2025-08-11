import { TestBed } from '@angular/core/testing';

import { PeachPaymentsService } from './peach-payments.service';

describe('PeachPaymentsService', () => {
  let service: PeachPaymentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PeachPaymentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
