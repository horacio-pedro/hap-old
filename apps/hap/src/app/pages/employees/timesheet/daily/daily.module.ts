// tslint:disable: nx-enforce-module-boundaries
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DailyRoutingModule } from './daily-routing.module';
import {
	NbCardModule,
	NbCheckboxModule,
	NbButtonModule,
	NbSelectModule,
	NbDatepickerModule,
	NbContextMenuModule,
	NbIconModule,
	NbDialogModule,
	NbSpinnerModule,
	NbPopoverModule
} from '@nebular/theme';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'apps/hap/src/app/@shared/shared.module';
import { FormsModule } from '@angular/forms';
import { TimerPickerModule } from 'apps/hap/src/app/@shared/timer-picker/timer-picker.module';
import { ProjectSelectModule } from 'apps/hap/src/app/@shared/project-select/project-select.module';
import { EmployeeSelectorsModule } from 'apps/hap/src/app/@theme/components/header/selectors/employee/employee.module';
import { DailyComponent } from './daily/daily.component';
import { EditTimeLogModalModule } from 'apps/hap/src/app/@shared/timesheet/edit-time-log-modal/edit-time-log-modal.module';
import { FiltersModule } from 'apps/hap/src/app/@shared/timesheet/filters/filters.module';
import { ViewTimeLogModule } from 'apps/hap/src/app/@shared/timesheet/view-time-log/view-time-log.module';
import { ViewTimeLogModalModule } from 'apps/hap/src/app/@shared/timesheet/view-time-log-modal/view-time-log-modal.module';
import { TaskSelectModule } from 'apps/hap/src/app/@shared/tasks/task-select/task-select.module';
import { DialogsModule } from 'apps/hap/src/app/@shared/dialogs';

@NgModule({
	declarations: [DailyComponent],
	imports: [
		CommonModule,
		DailyRoutingModule,
		NbCardModule,
		TranslateModule,
		NbCheckboxModule,
		NbButtonModule,
		NbSelectModule,
		SharedModule,
		NbDatepickerModule,
		FormsModule,
		NbContextMenuModule,
		NbIconModule,
		NbDialogModule,
		TimerPickerModule,
		TaskSelectModule,
		ProjectSelectModule,
		EditTimeLogModalModule,
		ViewTimeLogModalModule,
		NbIconModule,
		EmployeeSelectorsModule,
		FiltersModule,
		NbSpinnerModule,
		ViewTimeLogModule,
		NbPopoverModule,
		DialogsModule
	]
})
export class DailyModule {}
