import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficosbComponent } from './graficosb.component';

describe('GraficosbComponent', () => {
  let component: GraficosbComponent;
  let fixture: ComponentFixture<GraficosbComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GraficosbComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GraficosbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
