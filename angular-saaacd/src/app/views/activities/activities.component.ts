import { Component, OnInit, ViewChild } from '@angular/core';

import { ConfirmDialogModel, ConfirmDialogComponent } from '../confirmDialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

import { Actividad } from '../../models/Actividad';
import { Ubicacion } from '../../models/Ubicacion';
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
  activities: Actividad[];
  selectedActivity : Actividad;
  
  //Table Elements
  displayedColumns: string[] = [ 'id', 'prioridad', 'semestre', 'fechaAlta', 'usuario', 'categoria', 'ubicacion', 'dispositivo', 'estado'];
  dataSource: MatTableDataSource<Actividad>;
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
				  catchError(this.activityService.handleError<Actividad>('deleteActivity'));
				  this.notifyService.showErrorTimeout(this.deletionErrorMessage + this.selectedActivity.id, this.title);
				  }
		);
	  }
    });
  }
  
  rowSelected(a:Actividad){
	this.selectedActivity = a;
	console.log("Table selection:", a.id);
  }
  
  updateDataSource(){
    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource(this.activities);
	this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
	
	this.dataSource.sortingDataAccessor = (item, property) => {
		var sortingData= null;
		switch(property){
			case 'categoria':
				sortingData = item.categoria.nombre;
				break;
			case 'usuario':
				sortingData = item.usuario.first_name;
				break;
			case 'ubicacion':
				sortingData = item.ubicacion.tipoUbicacion.nombre + " " + item.ubicacion.nombre;
				break;
			case 'dispositivo':
				sortingData = this.getDispositivoText(item);
				break;
			case 'fechaAlta':
				sortingData = new Date(item.fechaAlta).getTime();
				break;
			case 'semestre':
				sortingData = item.semestre.nombre;
				break;
			default:
				sortingData = item[property];
				break;
		}
		return sortingData;
	};
	
	//set a new filterPredicate function
	  this.dataSource.filterPredicate = (data, filter: string) => {
		const accumulator = (currentTerm, key) => {
		  return this.nestedFilterCheck(currentTerm, data, key);
		};
		const dataStr = Object.keys(data).reduce(accumulator, '').toLowerCase();
		// Transform the filter by converting it to lowercase and removing whitespace.
		const transformedFilter = filter.trim().toLowerCase();
		return dataStr.indexOf(transformedFilter) !== -1;
	}
  }
  
 isActivitySelected(){
	return this.selectedActivity == undefined;
  }
  
  getActivitySelected(){
	if( this.selectedActivity== undefined){
	   return '';
	}else {
	   return this.selectedActivity;
	}
  }
  
  getDetailActivityUrl(): string{
	if( this.selectedActivity!= undefined){
		var url='/detail/' + this.selectedActivity.id;
		return url;
	}
	return '/detail/';
  }
  
  getPriorityImageUrl(priority: string): string{
	var url='';
	switch(priority){
		case 'a':
			url='../static/images/prioridadAlta.png';
			break;
		case 'm':
			url='../static/images/prioridadMedia.png';
			break;
		case 'b':
			url='../static/images/prioridadBaja.png';
			break;
	}
	return url;
  }
  
  getStatusImageUrl(status: string): string{
	var url='';
	switch(status){
		case 'r':
			url='../static/images/estadoRealizado.jpg';
			break;
		case 'p':
			url='../static/images/estadoPendiente.jpg';
			break;
		case 'e':
			url='../static/images/estadoProgreso.jpg';
			break;
	}
	return url;
  }
  
  getUbicacionText(activity:Actividad): string{
	var activityText = activity.ubicacion.tipoUbicacion.nombre + " " + activity.ubicacion.nombre;
	if(activity.ubicacion.ubicacionSuperior)
		activityText = activityText + "\n" + activity.ubicacion.ubicacionSuperior.tipoUbicacion.nombre + " " + activity.ubicacion.ubicacionSuperior.nombre;
    return activityText;
  }
  
  getDispositivoText(activity:Actividad): string{
    var activityText = "" ;
	if(activity.dispositivo)
	   activityText = activity.dispositivo.tipoDispositivo.nombre + " con número inventario UNAM " + activity.dispositivo.inventarioUNAM ;
	return activityText;
  }
  
  getFechaRequeridoText(activity:Actividad): string{
	var activityText = "" ;
	if(activity.fechaResolucion == null && activity.fechaRequerido != null)
		activityText = " -> " + activity.fechaRequerido;
	return activityText;
  }
  
  getFechaPeriodoText(activity:Actividad): string{
	var activityText = "" ;
	if(activity.fechaResolucion != null)
		activityText = " -> " + activity.fechaResolucion;
	return activityText;
  }

  /*********Filtering********/
  //also add this nestedFilterCheck class function
	nestedFilterCheck(search, data, key) {
	  if (typeof data[key] === 'object') {
		for (const k in data[key]) {
		  if (data[key][k] !== null) {
			search = this.nestedFilterCheck(search, data[key], k);
		  }
		}
	  } else {
		search += data[key];
	  }
	  return search;
	}
  
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  
  
  descapitalizeFirstLetter(s:string) {
       return s.charAt(0).toLowerCase() + s.slice(1);
  }

  
}
