import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,  HttpParams } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Reporte } from '../models/Reporte';
import { ExpiredDevice } from '../models/ExpiredDevice';
import { URLutility } from '../utilities/URLutility';

@Injectable({ providedIn: 'root' })
export class DeviceService {
  private deviceUrl = '/api/devices/';  // URL to web api
  private lifeTimeMonitoringUrl = 'api/lifeTimeDeviceByLocation/';
  private expiredDevicesUrl = 'api/expiredDevices/';
 
  constructor(
    private http: HttpClient) {}
  
 /** GET devices by location */
  getDevicesByLocation(id: number):  Observable<any>  {
	var options = URLutility.getHttpOptionsWithParam('location', id.toString());
    return this.http.get<Reporte[]>(this.deviceUrl, options);
  }
  
 getLifeTimeDeviceByLocation(id: number): Observable<any>{
	 var options = URLutility.getHttpOptionsWithParam('locationId', id.toString());
	 return this.http.get<Reporte[]>(this.lifeTimeMonitoringUrl, options);
  }
  
  getExpiredDevices(): Observable<any>{
    return this.http.get<ExpiredDevice[]>(this.expiredDevicesUrl);
  }
}
