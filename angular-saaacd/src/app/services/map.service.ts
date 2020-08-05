import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,  HttpParams } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Mapa } from '../models/Mapa';

@Injectable({ providedIn: 'root' })
export class MapService {
  private mapsUrl = '/api/maps';  // URL to web api
 
  constructor(private http: HttpClient) {}
  
 /** GET locations */
  getMaps(): Observable<Mapa[]> {
    return this.http.get<Mapa[]>(this.mapsUrl);
  }
 
}
