import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,  HttpParams } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { MessageService } from '../services/Message.service';

@Injectable({ providedIn: 'root' })
export class URLutility {
  public static httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  constructor(private http: HttpClient,
    private messageService: MessageService) {}
		
  public static getHttpOptionsWithParam(parameterName: string, parameterValue: string): any{
	let httpParams = new HttpParams().set(parameterName, parameterValue);
	let httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json',"X-CSRFToken": "F2jJcSOlbEQlmeEODBlLtwKWpwV9kK5MYAb2HLLraAtBN8xvGBtKjlpa4vna3zWs"});
	let options = { params: httpParams,
					headers: httpHeaders };
    return options;
  }
  
   /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
  */
  public static handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  /** Log message with the MessageService*/ 
  public static log(message: string) {
    //this.messageService.add(`Service: ${message}`);
  }
 
}
