import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { ActivityService } from '../../services/Activity.service';
import { Actividad } from '../../models/Actividad';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import { catchError} from 'rxjs/operators';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-monitor-dialog',
  templateUrl: './monitor-dialog.component.html',
  styleUrls: ['./monitor-dialog.component.css']
})
export class MonitorDialogComponent{
  locationName: string;
  locationId: number;
  isActivityMonitoring : boolean;
  activities: Actividad[];
  selectedActivity : Actividad;
  //Table Elements
  displayedColumns: string[] = [ 'id', 'prioridad', 'fechaAlta', 'usuario', 'categoria', 'dispositivo', 'estado', 'edit'];
  dataSource: MatTableDataSource<Actividad>;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  //Notification Elements
  title = 'Notificación';
  activityErrorMessage = 'No se ha podido mostrar las actividades';
  
  constructor(private activityService: ActivityService,
			  private notifyService : NotificationService, 
			  public dialogRef: MatDialogRef<MonitorDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: MonitorDialogModel) {
    // Update view with given values
	this.locationName = data.locationName;
    this.locationId = data.locationId;
    this.isActivityMonitoring = data.isActivityMonitoring;
	
	this.getActivitiesByLocation(this.locationId);
  }

  onConfirm(): void {
    // Close the dialog, return true
    this.dialogRef.close(true);
  }
 
  onDismiss(): void {
    // Close the dialog, return false
    this.dialogRef.close(false);
  }
  
  getActivitiesByLocation(locationId){
	this.activityService.getActivitiesByLocation(locationId)
	.subscribe(activities =>{ 
			this.activities = activities;
		    this.setDataSource();
			},
		error => {
			catchError(this.notifyService.handleError<Actividad>('getActivities'));
			this.notifyService.showErrorTimeout(this.activityErrorMessage, this.title);
	    }
	);
  }
  
    getPriorityImageUrl(priority: string): string{
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
  
  getStatusImageUrl(status: string): string{
	var url='';
	switch(status){
		case Actividad.STATUSES[0].id:
			url='../static/media/icons/estadoRealizado.jpg';
			break;
		case Actividad.STATUSES[1].id:
			url='../static/media/icons/estadoPendiente.jpg';
			break;
		case Actividad.STATUSES[2].id:
			url='../static/media/icons/estadoProgreso.jpg';
			break;
	}
	return url;
  }
  
  getDispositivoText(activity:Actividad): string{
    var activityText = "" ;
	if(activity.dispositivo)
	   activityText = activity.dispositivo.tipoDispositivo.nombre + " con número inventario UNAM " + activity.dispositivo.inventarioUNAM ;
	return activityText;
  }
  
  getFechaRequeridoText(activity:Actividad): string{
	var activityText = "" ;
	if(activity.fechaRequerido != null)
		activityText = " -> " + activity.fechaRequerido;
	return activityText;
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
  
  getDetailActivityUrl(id: number): string{
    url='/detail/';
	if(id!= undefined){
		var url='/detail/' + id;
	}
	return url;
  }
  
  setDataSource(){
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
			case 'dispositivo':
				sortingData = this.getDispositivoText(item);
				break;
			case 'fechaAlta':
				sortingData = new Date(item.fechaAlta).getTime();
				break;
			default:
				sortingData = item[property];
				break;
		}
		return sortingData;
	};

  }
}

/**
 * Class to represent confirm dialog model.
 *
 * It has been kept here to keep it as part of shared component.
 */
export class MonitorDialogModel {
 
  constructor(public locationId: number, public locationName: string, public isActivityMonitoring: boolean) {
  }
}
