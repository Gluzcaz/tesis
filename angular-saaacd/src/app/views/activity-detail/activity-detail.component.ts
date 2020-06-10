import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { Actividad } from '../../models/Actividad';
import { ActivityService } from '../../services/Activity.service';
import { NotificationService } from '../../services/notification.service'

import { catchError} from 'rxjs/operators';

@Component({
  selector: 'app-activity-detail',
  templateUrl: './activity-detail.component.html',
  styleUrls: [ './activity-detail.component.css' ]
})
export class ActivityDetailComponent implements OnInit {
  @Input() activity: Actividad;
  isEdition : boolean;
  id : number;
  
  //Notification Elements
  title = 'Notificación';
  updateSuccessMessage = 'Se ha actualizado satisfactoriamente la actividad con ID: ';
  updateErrorMessage = 'No se ha podido actualizar la actividad con ID: ';
  creationSuccessMessage = 'Se ha actualizado satisfactoriamente la actividad con ID: ';
  creationErrorMessage = 'No se ha podido actualizar la actividad con ID: ';

  constructor(
    private route: ActivatedRoute,
    private activityService: ActivityService,
    private location: Location,
	private notifyService : NotificationService
  ) {  
    this.id = +this.route.snapshot.paramMap.get('id');
  	this.isEdition = this.id > 0;
  }

  ngOnInit(): void { 
    console.log(this.isEdition);
	if(this.isEdition)
		this.getActivity();
	else 
		this.activity = {
		  'id': null,
		  'estado': '',
		  'prioridad': '',
		  'comentario': '',
		  'fechaResolucion': '',
		  'fechaAlta': '',
		  'fechaRequerido': '',
		  'esSiniestro': false,
		  'actividadSuperior': null,
		  'categoria': null,
		  'semestre': null,
		  'ubicacion': null,
		  'usuario': null,
		  'dispositivo': null
		};
  }

  getActivity(): void {
    this.activityService.getActivity(this.id)
      .subscribe(activity => this.activity = activity);
  }

  goBack(): void {
    this.location.back();
  }

  save(): void {
	if(this.isEdition)
		this.activityService.updateActivity(this.activity)
		  .subscribe(
					response => {
					  this.notifyService.showSuccessTimeout(this.updateSuccessMessage + this.activity.id, this.title);
					  this.goBack();
					  },
					error => {
					  catchError(this.activityService.handleError<Actividad>('deleteActivity'));
					  this.notifyService.showErrorTimeout(this.updateErrorMessage + this.activity.id, this.title);
					  this.goBack();
					  });
	else
		this.activityService.createActivity(this.activity)
		  .subscribe(
					response => {
					  this.notifyService.showSuccessTimeout(this.creationSuccessMessage + this.activity.id, this.title);
					  this.goBack();
					  },
					error => {
					  catchError(this.activityService.handleError<Actividad>('deleteActivity'));
					  this.notifyService.showErrorTimeout(this.creationErrorMessage + this.activity.id, this.title);
					  this.goBack();
					  });
		
  }
}
