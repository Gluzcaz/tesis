import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule }    from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
 
import { AppRoutingModule }     from './app-routing.module'; 
 
import { AppComponent } from './app.component';
import { ActivitiesComponent }      from './views/activities/activities.component';
import { MessagesComponent }    from './views/messages/messages.component';
import { ConfirmDialogComponent } from './views/confirmDialog/confirm-dialog.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import {MatTableModule} from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule} from '@angular/material/sort';
import { MatFormFieldModule} from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule} from '@angular/material/input';
import { MatMenuModule} from '@angular/material/menu';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { ActivityDetailComponent }  from './views/activity-detail/activity-detail.component';

 
@NgModule({
  declarations: [
    AppComponent,
	ActivitiesComponent,
    MessagesComponent,
    ConfirmDialogComponent,
	ActivityDetailComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
	FormsModule,
    AppRoutingModule,
	MatButtonModule, 
	MatDialogModule,
	NoopAnimationsModule,
	MatPaginatorModule,
	MatSortModule,
	MatTableModule,
	MatFormFieldModule,
	MatInputModule,
	MatMenuModule,
	BrowserAnimationsModule,
	MatSelectModule,
	ToastrModule.forRoot()
  ],
  providers: [],
  entryComponents: [ConfirmDialogComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
