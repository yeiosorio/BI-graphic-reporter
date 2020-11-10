import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkSpaceClientComponent } from './work-space-client.component';

describe('WorkSpaceClientComponent', () => {
  let component: WorkSpaceClientComponent;
  let fixture: ComponentFixture<WorkSpaceClientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkSpaceClientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkSpaceClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
