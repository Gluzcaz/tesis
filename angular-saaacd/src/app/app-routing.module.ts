import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ActivitiesComponent }      from './views/activities/activities.component';
import { ActivityDetailComponent }  from './views/activity-detail/activity-detail.component';

const routes: Routes = [
{ path: '', redirectTo: 'allActivities', pathMatch: 'full' },
{ path: 'allActivities', component: ActivitiesComponent },
{ path: 'create', component: ActivityDetailComponent },
{ path: 'detail/:id', component: ActivityDetailComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
