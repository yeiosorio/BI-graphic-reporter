import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InformeCdcComponent } from './info-cdc.component';

describe('InformeCdcComponent', () => {
  let component: InformeCdcComponent;
  let fixture: ComponentFixture<InformeCdcComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InformeCdcComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InformeCdcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
