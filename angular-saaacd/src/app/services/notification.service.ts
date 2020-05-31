import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  timespan : number = 5000;
  constructor(private toastr: ToastrService) { }
  
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
  
}
