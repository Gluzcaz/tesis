import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityMonitoringComponent } from './activity-monitoring.component';

describe('ActivityMonitoringComponent', () => {
  let component: ActivityMonitoringComponent;
  let fixture: ComponentFixture<ActivityMonitoringComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityMonitoringComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityMonitoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
