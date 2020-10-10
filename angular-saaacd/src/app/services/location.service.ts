import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,  HttpParams } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Ubicacion } from '../models/Ubicacion';
import { Reporte } from '../models/Reporte';
import { URLutility } from '../utilities/URLutility';

@Injectable({ providedIn: 'root' })
export class LocationService {
  private locationsUrl = '/api/locations'; 
  private inferiorLocationsUrl = '/api/inferiorLocations'; 
  private superiorLocationsUrl = '/api/superiorLocations';
  private saveLocationsUrl = '/api/saveLocations/';
  private activityMonitoringByLocationUrl = '/api/activityMonitoringByLocation/'
  private materialMonitoringByLocationUrl = '/api/materialMonitoringByLocation/'
 
  constructor(private http: HttpClient) {}
  
 /** GET locations */
  getLocations(): Observable<Ubicacion[]> {
    return this.http.get<Ubicacion[]>(this.locationsUrl);
  }
 
 /** GET superior locations */ 
  getSuperiorLocations(): Observable<Ubicacion[]> {
    return this.http.get<Ubicacion[]>(this.superiorLocationsUrl);
  }
  
   /** GET Locations By Superior Location */
  getLocationsBySuperiorLocation(id: number):  Observable<any> {
	var options = URLutility.getHttpOptionsWithParam('location', id.toString());
	console.log(options);
    return this.http.get<Ubicacion[]>(this.inferiorLocationsUrl, options);
  }
  
  getActivityStatisticByLocation(semesterId: number, locationType: boolean): Observable<any>{
	 var options = URLutility.getHttpOptionsWithParam('semesterId', semesterId.toString());
     var url = 'api/activityStatisticBySupLocation/';
	 if(locationType)
		url = 'api/activityStatisticByInfLocation/'
	 return this.http.get<Reporte[]>(url, options);
  }
 
  getMaterialStatisticByLocation(semesterId: number, locationType: boolean): Observable<any>{
	 var options = URLutility.getHttpOptionsWithParam('semesterId', semesterId.toString());
     var url = 'api/materialStatisticBySupLocation/';
	 if(locationType)
		url = 'api/materialStatisticByInfLocation/'
	 return this.http.get<Reporte[]>(url, options);
  }
  
  getActivityMonitoringByLocation(): Observable<Reporte[]> {
    return this.http.get<Reporte[]>(this.activityMonitoringByLocationUrl);
  }
  
  getMaterialMonitoringByLocation(): Observable<Reporte[]> {
    return this.http.get<Reporte[]>(this.materialMonitoringByLocationUrl);
  }
  
  /** PUT: update the activity on the server */
  updateLocation(locations: any): Observable<any> {
    return this.http.put<any>(this.saveLocationsUrl, locations, URLutility.httpOptions);
  }
 
}
