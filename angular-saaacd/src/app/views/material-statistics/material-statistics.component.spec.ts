import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialStatisticsComponent } from './material-statistics.component';

describe('MaterialStatisticsComponent', () => {
  let component: MaterialStatisticsComponent;
  let fixture: ComponentFixture<MaterialStatisticsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaterialStatisticsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
