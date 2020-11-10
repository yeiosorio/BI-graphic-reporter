import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerGraficoComponent } from './ver-grafico.component';

describe('VerGraficoComponent', () => {
  let component: VerGraficoComponent;
  let fixture: ComponentFixture<VerGraficoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerGraficoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerGraficoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
