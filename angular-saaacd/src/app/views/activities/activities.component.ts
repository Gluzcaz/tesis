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
	this.activities = this.activities.filter(a => a !== this.selectedActivity); //PENDIENTE VALIDACIÓN: ELIMINAR DE LA LISTA SOLO CUANDO SE ELIMINO EN DB
   	this.updateDataSource();
	
	this.activityService.openDialog(this.selectedActivity);
	this.selectedActivity = undefined;
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
