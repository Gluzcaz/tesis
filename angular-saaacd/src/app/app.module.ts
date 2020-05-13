import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule }    from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
 
import { AppRoutingModule }     from './app-routing.module'; 
 
import { AppComponent } from './app.component';
import { ActivitiesComponent }      from './views/activities/activities.component';
import { MessagesComponent }    from './views/messages/messages.component';

 
@NgModule({
  declarations: [
    AppComponent,
	ActivitiesComponent,
    MessagesComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
	FormsModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
