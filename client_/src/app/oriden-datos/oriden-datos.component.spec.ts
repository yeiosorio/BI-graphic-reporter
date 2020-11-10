import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OridenDatosComponent } from './oriden-datos.component';

describe('OridenDatosComponent', () => {
  let component: OridenDatosComponent;
  let fixture: ComponentFixture<OridenDatosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OridenDatosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OridenDatosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
