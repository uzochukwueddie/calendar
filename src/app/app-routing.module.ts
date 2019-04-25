import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'calendar', pathMatch: 'full' },
  { path: 'calendar', loadChildren: 'src/app/pages/calendar/calendar.module#CalendarPageModule' },
  { path: 'schedule', loadChildren: 'src/app/pages/schedule/schedule.module#SchedulePageModule' },
  { path: 'view-event/:id', loadChildren: 'src/app/pages/view-event/view-event.module#ViewEventPageModule' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
