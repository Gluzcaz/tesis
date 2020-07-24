import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,  HttpParams } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Actividad } from '../models/Actividad';
import { URLutility } from '../utilities/URLutility';

import { ConfirmDialogModel, ConfirmDialogComponent } from '../views/confirmDialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Injectable({ providedIn: 'root' })
export class ActivityService {
  private activitiesUrl = '/api/activities'; 
  private petitionActivitiesUrl = '/api/petitionActivities/'; 
  private detailActivityUrl = '/api/detailActivity/';
  private createActivityUrl = '/api/createActivity/';
  private saveActivityUrl = '/api/saveActivity/'
 
  
  constructor(
    private http: HttpClient,
	public dialog: MatDialog) {}

  
  /** DELETE: delete the Actividad */
  deleteActivity(activity: Actividad | number): Observable<any>{
    const id = typeof activity === 'number' ? activity : activity.id;
	var options = URLutility.getHttpOptionsWithParam('id', id.toString());
	return this.http.delete<Actividad>(this.detailActivityUrl, options);
 }

  /** GET activity by id. Will 404 if id not found */
  getActivity(id: number): Observable<any>{
    let options = URLutility.getHttpOptionsWithParam('id', id.toString());
    return this.http.get<Actividad>(this.detailActivityUrl, options);
  }
  
  /** GET activities */
  getActivities(): Observable<Actividad[]> {
    return this.http.get<Actividad[]>(this.activitiesUrl);
  }
  
  /** GET  petition activities */
  getPetitionActivities(): Observable<Actividad[]> {
    return this.http.get<Actividad[]>(this.petitionActivitiesUrl);
  }

  //////// Save methods //////////

  /** POST: add a new activity to the server */
  createActivity(newActivity: any): Observable<Actividad> {
    return this.http.post<any>(this.saveActivityUrl, newActivity, URLutility.httpOptions);
  }

  /** PUT: update the activity on the server */
  updateActivity(activity: any): Observable<Actividad> {
    return this.http.put<any>(this.saveActivityUrl, activity, URLutility.httpOptions);
  }

  /**
   * Handle deletion confirmation.
   */
  openDialog(activity: Actividad): Observable<any> {
    const message = "¿Realmente quieres eliminar la siguiente actividad?\n"
						+ activity.id + ".- " + activity.usuario.first_name + " reporta " + activity.categoria.nombre;
	const title = `Confirmación de eliminación`;
	
    const dialogData = new ConfirmDialogModel(title , message);
 
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: dialogData
    });
	
	return dialogRef.afterClosed();
  }
  
}
