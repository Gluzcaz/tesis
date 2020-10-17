import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule }    from '@angular/forms';
import { HttpClientModule,HttpClientXsrfModule } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DragDropModule } from '@angular/cdk/drag-drop';
 
import { AppRoutingModule }     from './app-routing.module'; 
 
import { AppComponent } from './app.component';
import { ActivitiesComponent }  from './views/activities/activities.component';
import { ConfirmDialogComponent } from './views/confirm-dialog/confirm-dialog.component';
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
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivityStatisticsComponent } from './views/activity-statistics/activity-statistics.component';
import { MaterialStatisticsComponent } from './views/material-statistics/material-statistics.component';
import { ActivityMonitoringComponent } from './views/activity-monitoring/activity-monitoring.component';
import { MonitorDialogComponent } from './views/monitor-dialog/monitor-dialog.component';
import { MaterialMonitoringComponent } from './views/material-monitoring/material-monitoring.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
 
@NgModule({
  declarations: [
    AppComponent,
	ActivitiesComponent,
    ConfirmDialogComponent,
	ActivityDetailComponent,
	MapComponent,
	ActivityStatisticsComponent,
	MaterialStatisticsComponent,
	ActivityMonitoringComponent,
	MonitorDialogComponent,
	MaterialMonitoringComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
	HttpClientXsrfModule.withOptions({
		cookieName: 'csrftoken',
		headerName: 'X-CSRFToken',
	}),
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
	MatProgressBarModule,
	MatProgressSpinnerModule,
	DragDropModule,
	ToastrModule.forRoot()
  ],
  providers: [{provide: MAT_DATE_LOCALE, useValue: 'es-ES'}],
  entryComponents: [ConfirmDialogComponent,	MonitorDialogComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
