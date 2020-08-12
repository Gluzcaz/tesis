import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,  HttpParams } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { RegionGeografica } from '../models/RegionGeografica';
import { URLutility } from '../utilities/URLutility';

@Injectable({ providedIn: 'root' })
export class RegionService {
  private regionsUrl = '/api/regions';  // URL to web api
 
  constructor(private http: HttpClient) {}

  getRegionsOnMap(id: number): Observable<any> {
	var options = URLutility.getHttpOptionsWithParam('map', id.toString());
    return this.http.get<RegionGeografica[]>(this.regionsUrl, options);
  }
 
}
