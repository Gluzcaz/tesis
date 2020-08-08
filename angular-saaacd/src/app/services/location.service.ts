import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,  HttpParams } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Ubicacion } from '../models/Ubicacion';
import { URLutility } from '../utilities/URLutility';

@Injectable({ providedIn: 'root' })
export class LocationService {
  private locationsUrl = '/api/locations'; 
  private inferiorLocationsUrl = '/api/inferiorLocations'; 
  private superiorLocationsUrl = '/api/superiorLocations';
 
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
    return this.http.get<Ubicacion[]>(this.inferiorLocationsUrl, options);
  }
 
}
