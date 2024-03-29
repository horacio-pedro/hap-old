// tslint:disable: nx-enforce-module-boundaries
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApprovalsRoutingModule } from './approvals-routing.module';
import { ApprovalsComponent } from './approvals/approvals.component';
import {
	NbCardModule,
	NbCheckboxModule,
	NbButtonModule,
	NbSelectModule,
	NbDatepickerModule,
	NbContextMenuModule,
	NbIconModule,
	NbDialogModule,
	NbPopoverModule,
	NbSpinnerModule
} from '@nebular/theme';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'apps/hap/src/app/@shared/shared.module';
import { FormsModule } from '@angular/forms';
import { TimerPickerModule } from 'apps/hap/src/app/@shared/timer-picker/timer-picker.module';
import { ProjectSelectModule } from 'apps/hap/src/app/@shared/project-select/project-select.module';
import { EmployeeSelectorsModule } from 'apps/hap/src/app/@theme/components/header/selectors/employee/employee.module';
import { MomentModule } from 'ngx-moment';
import { FiltersModule } from 'apps/hap/src/app/@shared/timesheet/filters/filters.module';
import { TaskSelectModule } from 'apps/hap/src/app/@shared/tasks/task-select/task-select.module';
import { DialogsModule } from 'apps/hap/src/app/@shared/dialogs';

@NgModule({
	declarations: [ApprovalsComponent],
	imports: [
		CommonModule,
		ApprovalsRoutingModule,
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
		NbIconModule,
		EmployeeSelectorsModule,
		NbPopoverModule,
		MomentModule,
		FiltersModule,
		NbSpinnerModule,
		DialogsModule
	]
})
export class ApprovalsModule {}
