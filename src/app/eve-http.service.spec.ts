import { TestBed } from '@angular/core/testing';

import { EveHttpService } from './eve-http.service';

describe('EveHttpService', () => {
  let service: EveHttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EveHttpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
