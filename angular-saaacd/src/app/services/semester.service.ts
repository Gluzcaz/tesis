import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,  HttpParams } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Semestre } from '../models/Semestre';

import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class SemesterService {
  private semestersUrl = '/api/semesters';  // URL to web api
  constructor(
    private http: HttpClient,
	private notifyService : NotificationService) {}
  
 /** GET semesters */
  getSemesters(): Observable<Semestre[]> {
    return this.http.get<Semestre[]>(this.semestersUrl);
  }
}
