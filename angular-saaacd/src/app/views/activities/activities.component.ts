import { Component, OnInit } from '@angular/core';

import { Activity } from '../../models/Activity';
import { ActivityService } from '../../services/Activity.service';

@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.css']
})
export class ActivitiesComponent implements OnInit {
  activities: Activity[];

  constructor(private activityService: ActivityService) { }

  ngOnInit() {
    this.getActivities();
  }

  getActivities(): void {
    this.activityService.getActivities()
    .subscribe(activities => this.activities = activities);
  }

  delete(activity: Activity): void {
    this.activities = this.activities.filter(a => a !== activity);
    this.activityService.deleteActivity(activity).subscribe();
  }

}
