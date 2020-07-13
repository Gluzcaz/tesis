import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,  HttpParams } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Usuario } from '../models/Usuario';

import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private usersUrl = '/api/users';  // URL to web api
  constructor(
    private http: HttpClient,
	private notifyService : NotificationService) {}
  
  getUsers(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.usersUrl);
  }
}
