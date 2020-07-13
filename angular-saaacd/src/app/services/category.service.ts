import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,  HttpParams } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Categoria } from '../models/Categoria';

import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private categoriesUrl = '/api/categories';  // URL to web api
  constructor(
    private http: HttpClient,
	private notifyService : NotificationService) {}
  
 /** GET categories */
  getCategories(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.categoriesUrl);
  }
}
