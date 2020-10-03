import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,  HttpParams } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { URLutility } from '../utilities/URLutility';

@Injectable({ providedIn: 'root' })
export class MonitorService {

  private detailActivityUrl = '/api/detailActivity/';
   
  constructor(private http: HttpClient) {}

  /** GET activity by id. Will 404 if id not found */
  getActivity(id: number): Observable<any>{
    let options = URLutility.getHttpOptionsWithParam('id', id.toString());
    return this.http.get<Actividad>(this.detailActivityUrl, options);
  }
}
