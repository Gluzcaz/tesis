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
  
  constructor(private activityService: ActivityService) {   
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
				  //console.log('response'+response);
				  this.activities = this.activities.filter(a => a !== this.selectedActivity);
   	              this.updateDataSource();
				  this.selectedActivity = undefined;},
				error => {
				  //console.log('error:'+error);
				  catchError(this.activityService.handleError<Activity>('deleteActivity'));}
		);
	  }
    });
  }
  
  rowSelected(a:any){
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
  
}
