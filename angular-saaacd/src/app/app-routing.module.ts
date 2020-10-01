import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ActivitiesComponent }      from './views/activities/activities.component';
import { ActivityDetailComponent }  from './views/activity-detail/activity-detail.component';
import { MapComponent }      from './views/map/map.component';
import { ActivityStatisticsComponent } from './views/activity-statistics/activity-statistics.component';
import { MaterialStatisticsComponent } from './views/material-statistics/material-statistics.component';
import { ActivityMonitoringComponent } from './views/activity-monitoring/activity-monitoring.component';

const routes: Routes = [
{ path: '', redirectTo: 'allActivities', pathMatch: 'full' },
{ path: 'allActivities', component: ActivitiesComponent },
{ path: 'create', component: ActivityDetailComponent },
{ path: 'detail/:id', component: ActivityDetailComponent },
{ path: 'map', component: MapComponent },
{ path: 'activityStatistic', component: ActivityStatisticsComponent },
{ path: 'materialStatistic', component: MaterialStatisticsComponent },
{ path: 'activityMonitoring', component: ActivityMonitoringComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
