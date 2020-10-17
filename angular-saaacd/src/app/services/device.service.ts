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
  private lifeTimeMonitoringUrl = 'api/deviceLifeTimeByLocation/';
  private expiredDevicesUrl = 'api/expiredDevices/';
  private deviceMonitoringByLocationUrl = '/api/deviceMonitoringByLocation/'
 
  constructor(
    private http: HttpClient) {}
  
 /** GET devices by location */
  getDevicesByLocation(id: number):  Observable<any>  {
	var options = URLutility.getHttpOptionsWithParam('location', id.toString());
    return this.http.get<Reporte[]>(this.deviceUrl, options);
  }
  
 getDeviceLifeTimeByLocation(id: number, semesterId: number): Observable<any>{
 	 var options = URLutility.getHttpOptionsWithTwoParam('locationId', id.toString(), 'semesterId', semesterId.toString())
	 return this.http.get<Reporte[]>(this.lifeTimeMonitoringUrl, options);
  }
  
 getExpiredDevices(semesterId): Observable<any>{
	var options = URLutility.getHttpOptionsWithParam('semesterId', semesterId.toString());
    return this.http.get<ExpiredDevice[]>(this.expiredDevicesUrl, options);
  }
    
 getDeviceMonitoringByLocation(semesterId): Observable<any> {
	var options = URLutility.getHttpOptionsWithParam('semesterId', semesterId.toString());
    return this.http.get<Reporte[]>(this.deviceMonitoringByLocationUrl, options);
  }
  
 getDeviceStatisticByLocation(semesterId: number, locationType: boolean): Observable<any>{
	 var options = URLutility.getHttpOptionsWithParam('semesterId', semesterId.toString());
     var url = 'api/deviceStatisticBySupLocation/';
	 if(locationType)
		url = 'api/deviceStatisticByInfLocation/'
	 return this.http.get<Reporte[]>(url, options);
  }
}
