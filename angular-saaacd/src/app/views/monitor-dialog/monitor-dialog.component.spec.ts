import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitorDialogComponent } from './monitor-dialog.component';

describe('MonitorDialogComponent', () => {
  let component: MonitorDialogComponent;
  let fixture: ComponentFixture<MonitorDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonitorDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonitorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
