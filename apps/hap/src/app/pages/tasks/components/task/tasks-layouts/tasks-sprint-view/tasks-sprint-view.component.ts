import {
	Component,
	OnInit,
	Input,
	Output,
	EventEmitter,
	SimpleChanges,
	OnChanges
} from '@angular/core';
import { SprintStoreService } from '../../../../../../@core/services/organization-sprint-store.service';
import {
	ITask,
	IOrganizationSprint,
	IOrganizationProject,
	IOrganization
} from '@hap/models';
import { Observable } from 'rxjs';
import { map, tap, filter, take } from 'rxjs/operators';
import {
	CdkDragDrop,
	moveItemInArray,
	transferArrayItem
} from '@angular/cdk/drag-drop';
import { HapEditableGridComponent } from '../../../../../../@shared/components/editable-grid/hap-editable-grid.component';
import { NbDialogService } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { TasksStoreService } from '../../../../../../@core/services/tasks-store.service';
import { Store } from 'apps/hap/src/app/@core/services/store.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
@UntilDestroy({ checkProperties: true })
@Component({
	selector: 'ga-tasks-sprint-view',
	templateUrl: './tasks-sprint-view.component.html',
	styleUrls: ['./tasks-sprint-view.component.scss']
})
export class TasksSprintViewComponent
	extends HapEditableGridComponent<ITask>
	implements OnInit, OnChanges {
	@Input() tasks: ITask[] = [];
	sprints: IOrganizationSprint[] = [];
	@Input() project: IOrganizationProject;
	backlogTasks: ITask[] = [];
	@Output() createTaskEvent: EventEmitter<any> = new EventEmitter();
	@Output() editTaskEvent: EventEmitter<any> = new EventEmitter();
	@Output() deleteTaskEvent: EventEmitter<any> = new EventEmitter();
	sprints$: Observable<IOrganizationSprint[]> = this.store$.sprints$.pipe(
		filter((sprints: IOrganizationSprint[]) => Boolean(sprints.length)),
		map((sprints: IOrganizationSprint[]): IOrganizationSprint[] =>
			sprints.filter(
				(sprint: IOrganizationSprint) =>
					sprint.projectId === this.project.id
			)
		),
		tap((sprints: IOrganizationSprint[]) => {
			this.sprintIds = [
				...sprints.map((sprint: IOrganizationSprint) => sprint.id),
				'backlog'
			];
		})
	);

	sprintIds: string[] = [];
	sprintActions: { title: string }[] = [];

	constructor(
		private store$: SprintStoreService,
		translateService: TranslateService,
		dialogService: NbDialogService,
		private taskStore: TasksStoreService,
		private storeSerive: Store
	) {
		super(translateService, dialogService);
	}

	ngOnInit(): void {
		this.backlogTasks = this.tasks;
		this.sprintActions = [
			{ title: 'Edit sprint' },
			{ title: 'Delete Sprint' }
		];
	}

	initOrganization(project: IOrganizationProject) {
		this.storeSerive.selectedOrganization$
			.pipe(
				filter((organization) => !!organization),
				tap((organization: IOrganization) =>
					this.store$.fetchSprints({
						organizationId: organization.id,
						projectId: project.id
					})
				),
				untilDestroyed(this)
			)
			.subscribe();
	}

	reduceTasks(tasks: ITask[]): void {
		this.sprints$
			.pipe(untilDestroyed(this))
			.subscribe((availableSprints: IOrganizationSprint[]) => {
				const sprints = availableSprints.reduce(
					(
						acc: { [key: string]: IOrganizationSprint },
						sprint: IOrganizationSprint
					) => {
						acc[sprint.id] = { ...sprint, tasks: [] };
						return acc;
					},
					{}
				);
				const backlog = [];
				tasks.forEach((task) => {
					if (!!task.organizationSprint) {
						sprints[task.organizationSprint.id].tasks.push(task);
					} else {
						backlog.push(task);
					}
				});
				this.sprints = Object.values(sprints);
				this.backlogTasks = backlog;
			});
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.tasks) {
			this.reduceTasks(changes.tasks.currentValue);
		}

		if (changes.project) {
			this.initOrganization(changes.project.currentValue);
		}
	}

	createTask(): void {
		this.createTaskEvent.emit();
	}

	editTask(selectedItem: ITask): void {
		this.editTaskEvent.emit(this.selectedItem || selectedItem);
	}

	deleteTask(selectedItem: ITask): void {
		this.deleteTaskEvent.emit(selectedItem);
	}

	drop(event: CdkDragDrop<string[]>) {
		if (event.previousContainer === event.container) {
			moveItemInArray(
				event.container.data,
				event.previousIndex,
				event.currentIndex
			);
		} else {
			this.taskStore.editTask({
				id: event.item.data.id,
				title: event.item.data.title,
				organizationSprint:
					this.sprints.find(
						(sprint) => sprint.id === event.container.id
					) || null
			});
			transferArrayItem(
				event.previousContainer.data,
				event.container.data,
				event.previousIndex,
				event.currentIndex
			);
		}
	}

	taskAction(evt: { action: string; task: ITask }): void {
		switch (evt.action) {
			case 'EDIT_TASK':
				this.editTask(evt.task);
				break;

			case 'DELETE_TASK':
				this.deleteTask(evt.task);
				break;
		}
	}

	changeTaskStatus({ id, status, title }: Partial<ITask>): void {
		this.taskStore.editTask({
			id,
			status,
			title
		});
	}

	completeSprint(sprint: IOrganizationSprint, evt: any): void {
		this.preventExpand(evt);
		this.store$
			.updateSprint({
				...sprint,
				isActive: false
			})
			.pipe(take(1), untilDestroyed(this))
			.subscribe();
	}

	trackByFn(task: ITask): string | null {
		return task.id ? task.id : null;
	}

	private preventExpand(evt: any): void {
		evt.stopPropagation();
		evt.preventDefault();
	}
}
