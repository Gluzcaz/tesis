import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialMonitoringComponent } from './material-monitoring.component';

describe('MaterialMonitoringComponent', () => {
  let component: MaterialMonitoringComponent;
  let fixture: ComponentFixture<MaterialMonitoringComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaterialMonitoringComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialMonitoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
