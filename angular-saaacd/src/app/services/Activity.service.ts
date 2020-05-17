import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Activity } from '../models/Activity';
import { MessageService } from './Message.service';

@Injectable({ providedIn: 'root' })
export class ActivityService {

  private activitiesUrl = '/api/activities';  // URL to web api

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
    private messageService: MessageService) { }

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

  /** DELETE: delete the Activity */
  deleteActivity(activity: Activity | number): Observable<Activity> {
    const id = typeof activity === 'number' ? activity : activity.id;
    const url = `${this.activitiesUrl}/${id}`;

    return this.http.delete<Activity>(url, this.httpOptions).pipe(
      tap(_ => this.log(`deleted activity id=${id}`)),
      catchError(this.handleError<Activity>('deleteActivity'))
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
}
