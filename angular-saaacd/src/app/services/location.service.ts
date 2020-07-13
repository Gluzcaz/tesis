import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,  HttpParams } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Ubicacion } from '../models/Ubicacion';

@Injectable({ providedIn: 'root' })
export class LocationService {
  private locationsUrl = '/api/locations';  // URL to web api
 
  constructor(private http: HttpClient) {}
  
 /** GET locations */
  getLocations(): Observable<Ubicacion[]> {
    return this.http.get<Ubicacion[]>(this.locationsUrl);
  }
 
}
