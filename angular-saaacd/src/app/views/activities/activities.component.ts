import { Component, OnInit } from '@angular/core';

import { ConfirmDialogModel, ConfirmDialogComponent } from '../confirmDialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

import { Activity } from '../../models/Activity';
import { ActivityService } from '../../services/Activity.service';

import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.css']
})
export class ActivitiesComponent implements OnInit {
  activities: Activity[];
  selectedActivity : Activity;

  constructor(private activityService: ActivityService) { }
  
  ngOnInit() {
    this.getActivities();
  }

  getActivities(): void {
    this.activityService.getActivities()
    .subscribe(activities => this.activities = activities);
  }
  
  confirmDialog(): void {
	this.activities = this.activities.filter(a => a !== this.selectedActivity); //PENDIENTE VALIDACIÓN: ELIMINAR DE LA LISTA SOLO CUANDO SE ELIMINO EN DB
   	this.activityService.openDialog(this.selectedActivity);
	this.selectedActivity = undefined;
  }
  
  rowSelected(a:any){
	this.selectedActivity = a;
	console.log("Table selection:", a.id);
  }
}
