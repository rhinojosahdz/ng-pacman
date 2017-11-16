import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PacmanDyingComponent } from './pacman-dying.component';

describe('PacmanDyingComponent', () => {
  let component: PacmanDyingComponent;
  let fixture: ComponentFixture<PacmanDyingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PacmanDyingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PacmanDyingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
