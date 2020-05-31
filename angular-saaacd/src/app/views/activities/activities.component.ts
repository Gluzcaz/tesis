import { Component, OnInit, ViewChild } from '@angular/core';

import { ConfirmDialogModel, ConfirmDialogComponent } from '../confirmDialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

import { Activity } from '../../models/Activity';
import { ActivityService } from '../../services/Activity.service';

import { Observable, of } from 'rxjs';

import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatFormFieldControl} from '@angular/material/form-field';

import { catchError} from 'rxjs/operators';
import { NotificationService } from '../../services/notification.service'

@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.css']
})
export class ActivitiesComponent implements OnInit {
  activities: Activity[];
  selectedActivity : Activity;
  
  //Table Elements
  displayedColumns: string[] = ['id', 'comentario'];
  dataSource: MatTableDataSource<Activity>;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  
  //Notification Elements
  title = 'Notificación';
  deletionSuccessMessage = 'Se ha eliminado satisfactoriamente la actividad con ID: ';
  deletionErrorMessage = 'No se ha podido eliminar la actividad con ID: ';
  
  constructor(private activityService: ActivityService, private notifyService : NotificationService) {   
  }
  
  ngOnInit() {
	this.getActivities();
  }

  getActivities(): void {
    this.activityService.getActivities()
    .subscribe(activities =>{ 
		this.activities = activities;
		this.updateDataSource();
	});
  }
  
  confirmDialog(): void {
	this.activityService.openDialog(this.selectedActivity).subscribe(confirmationResult => {
      if(confirmationResult){
	    this.activityService.deleteActivity(this.selectedActivity).subscribe(
				response => {
				  this.activities = this.activities.filter(a => a !== this.selectedActivity);
   	              this.updateDataSource();
    	          this.notifyService.showSuccessTimeout(this.deletionSuccessMessage + this.selectedActivity.id , this.title);
				  this.selectedActivity = undefined;
				  },
				error => {
				  catchError(this.activityService.handleError<Activity>('deleteActivity'));
				  this.notifyService.showErrorTimeout(this.deletionErrorMessage + this.selectedActivity.id, this.title);
				  }
		);
	  }
    });
  }
  
  rowSelected(a:Activity){
	this.selectedActivity = a;
	console.log("Table selection:", a.id);
  }
  
  updateDataSource(){
    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource(this.activities);
	this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  
  isActivitySelected(){
	return this.selectedActivity == undefined;
  }
  
  getDetailActivityUrl(): string{
	if( this.selectedActivity!= undefined){
		var url='/detail/' + this.selectedActivity.id;
		return url;
	}
	return '/detail/';
  }
  
}
