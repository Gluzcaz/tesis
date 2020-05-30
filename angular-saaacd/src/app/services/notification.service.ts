import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private toastr: ToastrService) { }
  
  showSuccessTimeout(message, title, timespan){
    this.toastr.success(message, title ,{
      timeOut : timespan
    })
  }
  
  showErrorTimeout(message, title, timespan){
      this.toastr.error(message, title,{
      timeOut : timespan
    })
  }
  
  showInfo(message, title){
      this.toastr.info(message, title)
  }
  
  showWarning(message, title){
      this.toastr.warning(message, title)
  }
  
}
