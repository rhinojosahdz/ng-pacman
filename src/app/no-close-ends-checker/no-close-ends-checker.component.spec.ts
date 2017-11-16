import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoCloseEndsCheckerComponent } from './no-close-ends-checker.component';

describe('NoCloseEndsCheckerComponent', () => {
  let component: NoCloseEndsCheckerComponent;
  let fixture: ComponentFixture<NoCloseEndsCheckerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoCloseEndsCheckerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoCloseEndsCheckerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
