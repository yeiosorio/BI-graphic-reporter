import { TestBed } from '@angular/core/testing';

import { InformeCdcService } from './info-cdc.service';

describe('InformeCdcService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: InformeCdcService = TestBed.get(InformeCdcService);
    expect(service).toBeTruthy();
  });
});
