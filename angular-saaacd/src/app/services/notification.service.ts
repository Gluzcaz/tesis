import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MessageService } from './Message.service';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  timespan : number = 5000;
  constructor(private toastr: ToastrService,
			  private messageService: MessageService	) { }
  
  showSuccessTimeout(message, title){
    this.toastr.success(message, title ,{
      timeOut : this.timespan
    })
  }
  
  showErrorTimeout(message, title){
      this.toastr.error(message, title,{
      timeOut : this.timespan
    })
  }
  
  showInfo(message, title){
      this.toastr.info(message, title)
  }
  
  showWarning(message, title){
      this.toastr.warning(message, title)
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
    this.messageService.add(`NotificationService: ${message}`);
  }

  }
  

