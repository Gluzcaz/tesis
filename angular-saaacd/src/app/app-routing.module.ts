import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ActivitiesComponent }      from './views/activities/activities.component';
import { ActivityDetailComponent }  from './views/activity-detail/activity-detail.component';
import { MapComponent }      from './views/map/map.component';

const routes: Routes = [
{ path: '', redirectTo: 'allActivities', pathMatch: 'full' },
{ path: 'allActivities', component: ActivitiesComponent },
{ path: 'create', component: ActivityDetailComponent },
{ path: 'detail/:id', component: ActivityDetailComponent },
{ path: 'map', component: MapComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
