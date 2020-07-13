import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,  HttpParams } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Dispositivo } from '../models/Dispositivo';
import { URLutility } from '../utilities/URLutility';

@Injectable({ providedIn: 'root' })
export class DeviceService {
  private deviceUrl = '/api/devices/';  // URL to web api
 
  constructor(
    private http: HttpClient) {}
  
 /** GET devices by location */
  getDevicesByLocation(id: number):  Observable<any>  {
	var options = URLutility.getHttpOptionsWithParam('location', id.toString());
    return this.http.get<Dispositivo[]>(this.deviceUrl, options);
  }
}
