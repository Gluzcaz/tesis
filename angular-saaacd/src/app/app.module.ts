import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule }    from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DragDropModule } from '@angular/cdk/drag-drop';
 
import { AppRoutingModule }     from './app-routing.module'; 
 
import { AppComponent } from './app.component';
import { ActivitiesComponent }  from './views/activities/activities.component';
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
import { MapComponent }  from './views/map/map.component';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import {MAT_DATE_LOCALE} from '@angular/material/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivityStatisticsComponent } from './views/activity-statistics/activity-statistics.component';

 
@NgModule({
  declarations: [
    AppComponent,
	ActivitiesComponent,
    MessagesComponent,
    ConfirmDialogComponent,
	ActivityDetailComponent,
	MapComponent,
	ActivityStatisticsComponent
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
	MatDatepickerModule,
	MatNativeDateModule,
	ReactiveFormsModule,
	MatCheckboxModule,
	DragDropModule,
	ToastrModule.forRoot()
  ],
  providers: [{provide: MAT_DATE_LOCALE, useValue: 'es-ES'}],
  entryComponents: [ConfirmDialogComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
