import { TestBed } from '@angular/core/testing';

import { MyAccountServiceService } from './my-account-service.service';

describe('MyAccountServiceService', () => {
  let service: MyAccountServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyAccountServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
