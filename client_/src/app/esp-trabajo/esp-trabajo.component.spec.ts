import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EspTrabajoComponent } from './esp-trabajo.component';

describe('EspTrabajoComponent', () => {
  let component: EspTrabajoComponent;
  let fixture: ComponentFixture<EspTrabajoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EspTrabajoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EspTrabajoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
