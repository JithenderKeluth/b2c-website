import { TestBed } from '@angular/core/testing';

import { SeatmapService } from './seatmap.service';

describe('SeatmapService', () => {
  let service: SeatmapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeatmapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
