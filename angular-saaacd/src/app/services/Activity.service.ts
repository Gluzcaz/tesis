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
  private deleteActivityUrl = '/api/deleteActivity/';
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
	public dialog: MatDialog) { }
  
  /** DELETE: delete the Activity */
  deleteActivity(activity: Activity | number): Observable<Activity> {
    const id = typeof activity === 'number' ? activity : activity.id;
	let httpParams = new HttpParams().set('id', id.toString());
	httpParams.set('Content-Type', 'application/json');
	let options = { params: httpParams };
	return this.http.delete<Activity>(this.deleteActivityUrl, options).pipe(
	tap(_ => this.log(`deleted activity id=${id}`)), catchError(this.handleError<Activity>('deleteActivity')));	
  }
 
  delete(id: number):  Observable<Activity>{
	let httpParams = new HttpParams().set('pk', '4');
	httpParams.set('Content-Type', 'application/json');
	let options = { params: httpParams };
    let url = '${this.activitiesUrl}/delete/';
	let a = this.http.delete<Activity>(url);
	console.log('url:' + url);
    return a;
  }
  

  /** GET activities */
  getActivities(): Observable<Activity[]> {
    return this.http.get<Activity[]>(this.activitiesUrl)
      .pipe(
        tap(_ => this.log('fetched activities')),
        catchError(this.handleError<Activity[]>('getActivities', []))
      );
  }

   /* GET activities whose name contains search term */
  searchActivities(term: string): Observable<Activity[]> {
    if (!term.trim()) {
      // if not search term, return empty activity array.
      return of([]);
    }
    return this.http.get<Activity[]>(`${this.activitiesUrl}/?name=${term}`).pipe(
      tap(x => x.length ?
         this.log(`found activities matching "${term}"`) :
         this.log(`no activities matching "${term}"`)),
      catchError(this.handleError<Activity[]>('searchActivities', []))
    );
  }

  //////// Save methods //////////

  /** POST: add a new activity to the server */
  addActivity(activity: Activity): Observable<Activity> {
    return this.http.post<Activity>(this.activitiesUrl, activity, this.httpOptions).pipe(
      tap((newActivity: Activity) => this.log(`added activity w/ id=${newActivity.id}`)),
      catchError(this.handleError<Activity>('addActivity'))
    );
  }

  /** PUT: update the activity on the server */
  updateActivity(activity: Activity): Observable<any> {
    return this.http.put(this.activitiesUrl, activity, this.httpOptions).pipe(
      tap(_ => this.log(`updated activity id=${activity.id}`)),
      catchError(this.handleError<any>('updateActivity'))
    );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
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
  
  /**
   * Handle deletion confirmation.
   */
  openDialog(activity: Activity): void {
    const message = `¿Realmente quieres eliminar la siguiente actividad?\n` +activity.comentario;
	const title = `Confirmación de eliminación`;
	
    const dialogData = new ConfirmDialogModel(title , message);
 
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: dialogData
    });
	
	dialogRef.afterClosed().subscribe(
	    dialogResult => {
			if(dialogResult){
				this.deleteActivity(activity.id).subscribe(
				response => {
				  console.log(response);
				},
				error => {
				  console.log('error:'+error);
				});
			}
		}
    );
  }
}
