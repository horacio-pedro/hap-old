import { Component, Input, OnInit } from '@angular/core';
import { ITask, IOrganizationProject, IEmployee, ITag } from '@hap/models';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NbDialogRef, NbToastrService } from '@nebular/theme';
import { OrganizationProjectsService } from '../../../../@core/services/organization-projects.service';
import { Store } from '../../../../@core/services/store.service';
import { TranslateService } from '@ngx-translate/core';
import { ErrorHandlingService } from '../../../../@core/services/error-handling.service';
import { TranslationBaseComponent } from '../../../../@shared/language-base/translation-base.component';
import * as moment from 'moment';
import { EmployeesService } from '../../../../@core/services';
import { first } from 'rxjs/operators';

const initialTaskValue = {
	title: '',
	project: null,
	status: '',
	members: null,
	teams: null,
	estimate: null,
	dueDate: null,
	description: '',
	tags: null
};

@Component({
	selector: 'ngx-my-task-dialog',
	templateUrl: './my-task-dialog.component.html',
	styleUrls: ['./my-task-dialog.component.scss']
})
export class MyTaskDialogComponent
	extends TranslationBaseComponent
	implements OnInit {
	form: FormGroup;
	selectedTaskId: string;
	projects: IOrganizationProject[];
	statuses: string[] = ['Todo', 'In Progress', 'For Testing', 'Completed'];
	employees: IEmployee[] = [];
	selectedMembers: string[];
	selectedTask: ITask;
	organizationId: string;
	selectedTags: any;
	participants = 'employees';
	employeeId;
	tags: ITag[] = [];
	@Input() task: Partial<ITask> = {};

	constructor(
		public dialogRef: NbDialogRef<MyTaskDialogComponent>,
		private fb: FormBuilder,
		private store: Store,
		private _organizationsStore: Store,
		private organizationProjectsService: OrganizationProjectsService,
		readonly translateService: TranslateService,
		private readonly toastrService: NbToastrService,
		private errorHandler: ErrorHandlingService,
		private employeesService: EmployeesService
	) {
		super(translateService);
	}

	ngOnInit() {
		this.loadProjects();
		this.loadEmployees();
		this.initializeForm(
			Object.assign({}, initialTaskValue, this.selectedTask || this.task)
		);
	}

	private async loadProjects() {
		const organizationId = this._organizationsStore.selectedOrganization.id;
		const { items } = await this.organizationProjectsService.getAll(
			//['client']
			[],
			{
				organizationId: organizationId
			}
		);

		if (items) this.projects = items;
	}

	initializeForm({
		title,
		description,
		project,
		status,
		members,
		estimate,
		dueDate,
		tags
	}: ITask) {
		const duration = moment.duration(estimate, 'seconds');
		// select members from database of default value
		this.selectedMembers = (members || []).map((member) => member.id);
		// employee id of logged in user, if value is null, disable the save button
		this.employeeId = null;
		if (this.store.user) {
			this.employeeId = this.store.user.employeeId || null;
		}
		// select default id of logged in user
		if (members === null) {
			this.selectedMembers = [this.employeeId];
		}
		this.form = this.fb.group({
			title: [title, Validators.required],
			project: [project],
			status: [status],
			members: [members],
			estimateDays: [duration.days() || ''],
			estimateHours: [
				duration.hours() || '',
				[Validators.min(0), Validators.max(23)]
			],
			estimateMinutes: [
				duration.minutes() || '',
				[Validators.min(0), Validators.max(59)]
			],
			dueDate: [dueDate],
			description: [description],
			tags: [tags],
			teams: []
		});
		this.tags = this.form.get('tags').value || [];
	}

	addNewProject = (name: string): Promise<IOrganizationProject> => {
		this.organizationId = this.store.selectedOrganization.id;
		try {
			this.toastrService.primary(
				this.getTranslation(
					'NOTES.ORGANIZATIONS.EDIT_ORGANIZATIONS_PROJECTS.ADD_PROJECT',
					{
						name: name
					}
				),
				this.getTranslation('TOASTR.TITLE.SUCCESS')
			);
			return this.organizationProjectsService.create({
				name,
				organizationId: this.organizationId
			});
		} catch (error) {
			this.errorHandler.handleError(error);
		}
	};

	onSave() {
		if (this.form.valid) {
			this.form
				.get('members')
				.setValue(
					(this.selectedMembers || [])
						.map((id) => this.employees.find((e) => e.id === id))
						.filter((e) => !!e)
				);
			this.dialogRef.close(this.form.value);
		}
	}

	selectedTagsHandler(ev) {
		// we dont need this, at least we dont need for create or update TASK
		// this.tags = ev;
	}

	private async loadEmployees() {
		const organizationId = this._organizationsStore.selectedOrganization.id;
		if (!organizationId) {
			return;
		}

		const { items } = await this.employeesService
			.getAll(['user'], { organization: { id: organizationId } })
			.pipe(first())
			.toPromise();

		this.employees = items;
	}
}
