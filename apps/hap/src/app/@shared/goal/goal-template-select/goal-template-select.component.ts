import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { GoalTemplatesService } from '../../../@core/services/goal-templates.service';
import {
	IGoalTemplate,
	IGoalTimeFrame,
	TimeFrameStatusEnum,
	IEmployee,
	IOrganizationTeam,
	GoalLevelEnum,
	KeyResultWeightEnum,
	KeyResultTypeEnum,
	IOrganization
} from '@hap/models';
import { GoalSettingsService } from '../../../@core/services/goal-settings.service';
import { Store } from '../../../@core/services/store.service';
import { isFuture } from 'date-fns';
import {
	NbDialogRef,
	NbDialogService,
	NbStepperComponent
} from '@nebular/theme';
import { EditTimeFrameComponent } from '../../../pages/goal-settings/edit-time-frame/edit-time-frame.component';
import { first, takeUntil } from 'rxjs/operators';
import { GoalService } from '../../../@core/services/goal.service';
import { EmployeesService } from '../../../@core/services';
import { Subject } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { KeyResultService } from '../../../@core/services/keyresult.service';

@Component({
	selector: 'ga-goal-template-select',
	templateUrl: './goal-template-select.component.html',
	styleUrls: ['./goal-template-select.component.scss']
})
export class GoalTemplateSelectComponent implements OnInit, OnDestroy {
	goalTemplates: IGoalTemplate[];
	selectedGoalTemplate: IGoalTemplate;
	timeFrames: IGoalTimeFrame[] = [];
	timeFrameStatusEnum = TimeFrameStatusEnum;
	employees: IEmployee[];
	teams: IOrganizationTeam[] = [];
	orgId: string;
	orgName: string;
	goalDetailsForm: FormGroup;
	private _ngDestroy$ = new Subject<void>();
	organization: IOrganization;
	@ViewChild('stepper') stepper: NbStepperComponent;

	constructor(
		private goalTemplateService: GoalTemplatesService,
		private goalSettingService: GoalSettingsService,
		private store: Store,
		private dialogRef: NbDialogRef<GoalTemplateSelectComponent>,
		private dialogService: NbDialogService,
		private goalService: GoalService,
		private keyResultService: KeyResultService,
		private employeeService: EmployeesService,
		private fb: FormBuilder,
		private goalSettingsService: GoalSettingsService
	) {}

	async ngOnInit() {
		this.organization = this.store.selectedOrganization;
		this.goalDetailsForm = this.fb.group({
			deadline: ['', Validators.required],
			owner: ['', Validators.required],
			level: [
				!!this.selectedGoalTemplate
					? this.selectedGoalTemplate.level
					: GoalLevelEnum.ORGANIZATION,
				Validators.required
			],
			lead: [null]
		});
		await this.getTimeFrames();

		const { id: organizationId, tenantId } = this.organization;
		this.goalTemplateService
			.getAllGoalTemplates({ organizationId, tenantId })
			.then((res) => {
				const { items } = res;
				this.goalTemplates = items;
			});

		this.employeeService
			.getAll(['user'], { organizationId, tenantId })
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((employees) => {
				this.employees = employees.items;
			});
	}

	async getTimeFrames() {
		const { id: organizationId, tenantId } = this.organization;
		const findObj = {
			organization: {
				id: organizationId
			},
			tenantId
		};
		await this.goalSettingService.getAllTimeFrames(findObj).then((res) => {
			if (res) {
				this.timeFrames = res.items.filter(
					(timeframe) =>
						timeframe.status === this.timeFrameStatusEnum.ACTIVE &&
						isFuture(new Date(timeframe.endDate))
				);
			}
		});
	}

	async openSetTimeFrame() {
		const dialog = this.dialogService.open(EditTimeFrameComponent, {
			context: {
				type: 'add'
			},
			closeOnBackdropClick: false
		});
		const response = await dialog.onClose.pipe(first()).toPromise();
		if (response) {
			await this.getTimeFrames();
		}
	}

	nextStep(goalTemplate) {
		this.stepper.next();
		this.selectedGoalTemplate = goalTemplate;
	}

	async createGoal() {
		if (!!this.selectedGoalTemplate && !!this.goalDetailsForm.valid) {
			const goalDetailsFormValue = this.goalDetailsForm.value;
			delete goalDetailsFormValue.level;

			const { id: organizationId, tenantId } = this.organization;
			const goal = {
				...this.selectedGoalTemplate,
				...goalDetailsFormValue,
				description: ' ',
				progress: 0,
				organizationId,
				tenantId
			};
			goal[
				this.goalDetailsForm.value.level === GoalLevelEnum.EMPLOYEE
					? 'ownerEmployee'
					: this.goalDetailsForm.value.level === GoalLevelEnum.TEAM
					? 'ownerTeam'
					: 'organization'
			] = this.goalDetailsForm.value.owner;
			delete goal.owner;
			delete goal.keyResults;
			const goalCreated = await this.goalService.createGoal(goal);
			if (goalCreated) {
				const kpicreatedPromise = [];
				this.selectedGoalTemplate.keyResults.forEach(
					async (keyResult) => {
						if (keyResult.type === KeyResultTypeEnum.KPI) {
							const kpiData = {
								...keyResult.kpi,
								organization: this.orgId
							};
							await this.goalSettingsService
								.createKPI(kpiData)
								.then((res) => {
									if (res) {
										keyResult.kpiId = res.id;
									}
									kpicreatedPromise.push(keyResult);
								});
						}
					}
				);
				Promise.all(kpicreatedPromise).then(async () => {
					const keyResults = this.selectedGoalTemplate.keyResults.map(
						(keyResult) => {
							delete keyResult.kpi;
							delete keyResult.goalId;
							return {
								...keyResult,
								goalId: goalCreated.id,
								description: ' ',
								progress: 0,
								update: keyResult.initialValue,
								owner: this.employees[0].id,
								organizationId,
								tenantId,
								status: 'none',
								weight: KeyResultWeightEnum.DEFAULT
							};
						}
					);

					await this.keyResultService
						.createBulkKeyResult(keyResults)
						.then((res) => {
							if (res) {
								this.closeDialog('done');
							}
						});
				});
			}
		}
	}

	previousStep() {
		this.stepper.previous();
	}

	closeDialog(data) {
		this.dialogRef.close(data);
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
