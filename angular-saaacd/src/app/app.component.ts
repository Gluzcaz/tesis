import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
import { URLutility } from './utilities/URLutility';
 
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
 title = 'SAAACD';
 
 constructor(private http: HttpClient,private location: Location){
 }
 
 logout(){
	//localStorage.clearAll();
	//if (window.sessionStorage) {     
	//	sessionStorage.clear();     } 
	//window.location='/logout'
	//delete $sessionStorage.sessname;
	//console.log(this.http.post<any>('/logout/', null, URLutility.httpOptions));
	//this.location.go('/logout/');
	
	(sessionStorage as any).clear(); //Pendiente
	(window as any).location='/logout/';
 }
}