import { TestBed, inject } from '@angular/core/testing';

import { MovingObjectService } from './moving-object.service';

describe('MovingObjectService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MovingObjectService]
    });
  });

  it('should be created', inject([MovingObjectService], (service: MovingObjectService) => {
    expect(service).toBeTruthy();
  }));
});
