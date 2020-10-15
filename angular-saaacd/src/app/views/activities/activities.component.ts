import { Component, OnInit, ViewChild } from '@angular/core';

import { ConfirmDialogModel, ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

import { Actividad } from '../../models/Actividad';
import { Ubicacion } from '../../models/Ubicacion';
import { Semestre } from '../../models/Semestre';
import { ActivityService } from '../../services/activity.service';
import { SemesterService } from '../../services/semester.service';

import { Observable, of } from 'rxjs';

import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatFormFieldControl} from '@angular/material/form-field';

import { catchError} from 'rxjs/operators';
import { NotificationService } from '../../services/notification.service'

import {animate, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})

export class ActivitiesComponent implements OnInit {
  activities: Actividad[];
  allActivities: Actividad[];
  selectedActivity : Actividad;
  expandedActivity: Actividad | null;
  selectedSemester: number;
  semesters: Semestre[];
  
  //Table Elements
  displayedColumns: string[] = [ 'id', 'prioridad', 'semestre', 'fechaAlta', 'usuario', 'categoria', 'ubicacion', 'dispositivo', 'estado', 'actividadSuperior'];
  dataSource: MatTableDataSource<Actividad>;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  
  //Notification Elements
  title = 'Notificación';
  deletionSuccessMessage = 'Se ha eliminado satisfactoriamente la actividad con ID: ';
  deletionErrorMessage = 'No se ha podido eliminar la actividad con ID: ';
  semesterErrorMessage = 'No se ha podido mostrar los semestres';
  activityErrorMessage = 'No se ha podido mostrar las actividades';
  
  constructor(private activityService: ActivityService, 
			  private semesterService: SemesterService, 
			  private notifyService : NotificationService) {   
  }
  
  ngOnInit() {
    this.getSemesters();
	this.getActivities();
  }
  
  getActivities(): void {
    this.activityService.getActivities()
    .subscribe(activities =>{ 
			this.allActivities = activities;
			this.filterActivitiesBySemester();
		},
		error => {
			catchError(this.notifyService.handleError<Actividad>('getActivities'));
			this.notifyService.showErrorTimeout(this.activityErrorMessage, this.title);
	    }
	);
  }
  
  confirmDialog(): void {
	this.activityService.openDialog(this.selectedActivity).subscribe(confirmationResult => {
      if(confirmationResult){
	    this.activityService.deleteActivity(this.selectedActivity).subscribe(
				response => {
				  this.activities = this.activities.filter(a => a.id !== this.selectedActivity.id);
   	              this.updateDataSource();
    	          this.notifyService.showSuccessTimeout(this.deletionSuccessMessage + this.selectedActivity.id , this.title);
				  this.selectedActivity = undefined;
				  },
				error => {
				  catchError(this.notifyService.handleError<Actividad>('deleteActivity'));
				  this.notifyService.showErrorTimeout(this.deletionErrorMessage + this.selectedActivity.id, this.title);
				  }
		);
	  }
    });
  }
  
  rowSelected(a:Actividad){
	this.selectedActivity = a;
	this.expandedActivity = this.expandedActivity === a ? null : a;
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
  
  getPriorityImageUrl(priority: number): string{
	var url='';
	switch(priority){
		case Actividad.PRIORITIES[0].id:
			url='../static/media/icons/prioridadAlta.png';
			break;
		case Actividad.PRIORITIES[1].id:
			url='../static/media/icons/prioridadMedia.png';
			break;
		case Actividad.PRIORITIES[2].id:
			url='../static/media/icons/prioridadBaja.png';
			break;
	}
	return url;
  }
  
  getStatusImageUrl(status: number): string{
	var url='';
	switch(status){
		case Actividad.STATUSES[0].id:
			url='../static/media/icons/estadoPendiente.jpg';
			break;
		case Actividad.STATUSES[1].id:
			url='../static/media/icons/estadoProgreso.jpg';
			break;
		case Actividad.STATUSES[2].id:
			url='../static/media/icons/estadoRealizado.jpg';
			break;
	}
	return url;
  }
  
  getUbicacionText(activity:Actividad): string{
	var activityText = "";
	if(activity.ubicacion){
		var activityText = activity.ubicacion.tipoUbicacion.nombre + " " + activity.ubicacion.nombre;
		if(activity.ubicacion.ubicacionSuperior)
			activityText = activityText + "\n" + activity.ubicacion.ubicacionSuperior.tipoUbicacion.nombre + " " + activity.ubicacion.ubicacionSuperior.nombre;
    }
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
   
  getSemesters(){
    this.semesterService.getSemesters()
    .subscribe(semesters =>{ 
				this.semesters = semesters;
				this.selectedSemester = this.semesterService.getDefaultSemester( this.semesters );
				this.semesters.push({"id": 0, "nombre": "Todos", "esActivo": false});
	           },
			   error => {
				  catchError(this.notifyService.handleError<Semestre>('getSemester'));
				  this.notifyService.showErrorTimeout(this.semesterErrorMessage, this.title);
				  }
			   );
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
  
  filterActivitiesBySemester(){
    if(this.selectedSemester == 0){
		this.activities = this.allActivities;
	} 
	else {
		this.activities = this.allActivities.filter((activity: Actividad) =>
			activity.semestre.id == this.selectedSemester);
	}
	this.updateDataSource();
  }


  descapitalizeFirstLetter(s:string) {
       return s.charAt(0).toLowerCase() + s.slice(1);
  }

  
}
