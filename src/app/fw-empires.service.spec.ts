import { TestBed } from '@angular/core/testing';

import { FwEmpiresService } from './fw-empires.service';

describe('FwEmpiresService', () => {
  let service: FwEmpiresService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FwEmpiresService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
