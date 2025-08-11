import { TestBed } from '@angular/core/testing';

import { IframeWidgetService } from './iframe-widget.service';

describe('IframeWidgetService', () => {
  let service: IframeWidgetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IframeWidgetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
