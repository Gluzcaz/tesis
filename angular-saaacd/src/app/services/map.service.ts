import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,  HttpParams } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Mapa } from '../models/Mapa';

@Injectable({ providedIn: 'root' })
export class MapService {
  private mapsUrl = '/api/maps';  // URL to web api
  private activeMapUrl = '/api/activeMap';
 
  constructor(private http: HttpClient) {}
  
 /** GET maps */
  getMaps(): Observable<Mapa[]> {
    return this.http.get<Mapa[]>(this.mapsUrl);
  }
  
 /** GET activeMap */
  getActiveMap(): Observable<Mapa> {
    return this.http.get<Mapa>(this.activeMapUrl);
  }
 
}
