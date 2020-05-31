import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,  HttpParams } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Activity } from '../models/Activity';
import { MessageService } from './Message.service';

import { ConfirmDialogModel, ConfirmDialogComponent } from '../views/confirmDialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Injectable({ providedIn: 'root' })
export class ActivityService {
  private activitiesUrl = '/api/activities';  // URL to web api
  private detailActivityUrl = '/api/detailActivity/';
  private createActivityUrl = '/api/createActivity/';
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  
  constructor(
    private http: HttpClient,
    private messageService: MessageService,
	public dialog: MatDialog) {}
	
  getHttpOptionsWithNumberParam(id: number): any{
	let httpParams = new HttpParams().set('id', id.toString());
	let httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' })
	let options = { params: httpParams,
					headers: httpHeaders };
    return options;
  }
  
  /** DELETE: delete the Activity */
  deleteActivity(activity: Activity | number): Observable<any>{
    const id = typeof activity === 'number' ? activity : activity.id;
	var options = this.getHttpOptionsWithNumberParam(id);
	return this.http.delete<Activity>(this.detailActivityUrl, options);
 }

  /** GET activity by id. Will 404 if id not found */
  getActivity(id: number): Observable<any>{
    let options = this.getHttpOptionsWithNumberParam(id);
    return this.http.get<Activity>(this.detailActivityUrl, options).pipe(
      tap(_ => this.log(`fetched hero id=${id}`)),
      catchError(this.handleError<Activity>(`getActivity id=${id}`))
    );
  }
  
  /** GET activities */
  getActivities(): Observable<Activity[]> {
    return this.http.get<Activity[]>(this.activitiesUrl)
      .pipe(
        tap(_ => this.log('fetched activities')),
        catchError(this.handleError<Activity[]>('getActivities', []))
      );
  }

  //////// Save methods //////////

  /** POST: add a new activity to the server */
  createActivity(newActivity: Activity): Observable<Activity> {
    return this.http.post<Activity>(this.createActivityUrl, newActivity, this.httpOptions).pipe(
      tap((newActivity: Activity) => this.log(`added activity w/ id=${newActivity.id}`)),
      catchError(this.handleError<Activity>('createActivity'))
    );
  }

  /** PUT: update the activity on the server */
  updateActivity(activity: Activity): Observable<Activity> {
	let options = this.getHttpOptionsWithNumberParam(activity.id);
    return this.http.put(this.detailActivityUrl, activity, this.httpOptions).pipe(
      tap(_ => this.log(`updated activity id=${activity.id}`)),
      catchError(this.handleError<any>('updateActivity'))
    );
  }

  /**
   * Handle deletion confirmation.
   */
  openDialog(activity: Activity): Observable<any> {
    const message = `¿Realmente quieres eliminar la siguiente actividad?\n` +activity.comentario;
	const title = `Confirmación de eliminación`;
	
    const dialogData = new ConfirmDialogModel(title , message);
 
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: dialogData
    });
	
	return dialogRef.afterClosed();
  }
  
  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
  */
  handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  /** Log a ActivityService message with the MessageService */
  private log(message: string) {
    this.messageService.add(`ActivityService: ${message}`);
  }
}
