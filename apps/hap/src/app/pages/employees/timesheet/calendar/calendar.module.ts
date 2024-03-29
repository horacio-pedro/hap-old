// tslint:disable: nx-enforce-module-boundaries
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarRoutingModule } from './calendar-routing.module';
import { CalendarComponent } from './calendar/calendar.component';
import { ShareModule } from 'apps/hap/src/app/share/share.module';
import { FullCalendarModule } from '@fullcalendar/angular';
import { TranslateModule } from '@ngx-translate/core';
import { EmployeeSelectorsModule } from 'apps/hap/src/app/@theme/components/header/selectors/employee/employee.module';
import {
	NbDialogModule,
	NbCardModule,
	NbButtonModule,
	NbIconModule,
	NbSpinnerModule
} from '@nebular/theme';
import { SharedModule } from 'apps/hap/src/app/@shared/shared.module';
import { EditTimeLogModalModule } from 'apps/hap/src/app/@shared/timesheet/edit-time-log-modal/edit-time-log-modal.module';
import { FiltersModule } from 'apps/hap/src/app/@shared/timesheet/filters/filters.module';
import { ViewTimeLogModalModule } from 'apps/hap/src/app/@shared/timesheet/view-time-log-modal/view-time-log-modal.module';

@NgModule({
	declarations: [CalendarComponent],
	imports: [
		CommonModule,
		CalendarRoutingModule,
		ShareModule,
		FullCalendarModule,
		TranslateModule,
		EmployeeSelectorsModule,
		NbDialogModule,
		SharedModule,
		NbCardModule,
		NbButtonModule,
		EditTimeLogModalModule,
		ViewTimeLogModalModule,
		FiltersModule,
		NbIconModule,
		NbSpinnerModule
	]
})
export class CalendarModule {}
