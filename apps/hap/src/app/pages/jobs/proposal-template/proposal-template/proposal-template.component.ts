import { Component, OnDestroy, OnInit } from '@angular/core';
import { IEmployeeProposalTemplate } from '@hap/models';
import { NbDialogService } from '@nebular/theme';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { Store } from 'apps/hap/src/app/@core/services/store.service';
import { ToastrService } from 'apps/hap/src/app/@core/services/toastr.service';
import { AvatarComponent } from 'apps/hap/src/app/@shared/components/avatar/avatar.component';
import { TranslationBaseComponent } from 'apps/hap/src/app/@shared/language-base/translation-base.component';
import {
	Nl2BrPipe,
	TruncatePipe
} from 'apps/hap/src/app/@shared/pipes/text.pipe';
import { SelectedEmployee } from 'apps/hap/src/app/@theme/components/header/selectors/employee/employee.component';
import { LocalDataSource } from 'ng2-smart-table';
import { Subject } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { AddEditProposalTemplateComponent } from '../add-edit-proposal-template/add-edit-proposal-template.component';
import { ProposalTemplateService } from '../proposal-template.service';

@UntilDestroy()
@Component({
	selector: 'ga-proposal-template',
	templateUrl: './proposal-template.component.html',
	styleUrls: ['./proposal-template.component.scss']
})
export class ProposalTemplateComponent
	extends TranslationBaseComponent
	implements OnInit, OnDestroy {
	settingsSmartTable: any = {
		editable: false,
		actions: false
	};

	disableButton = true;
	smartTableSource: LocalDataSource = new LocalDataSource();
	selectedEmployee: SelectedEmployee;
	proposalTemplateRequest: any = {
		relations: ['employee', 'employee.user']
	};
	updateJobs$: Subject<any> = new Subject();
	selectedItem: any;

	constructor(
		public translateService: TranslateService,
		private store: Store,
		private toastrService: ToastrService,
		private proposalTemplateService: ProposalTemplateService,
		private dialogService: NbDialogService,
		private nl2BrPipe: Nl2BrPipe,
		private truncatePipe: TruncatePipe
	) {
		super(translateService);
	}

	ngOnInit(): void {
		this.updateJobs$
			.pipe(untilDestroyed(this), debounceTime(500))
			.subscribe(() => {
				this.getProposalTemplates();
			});

		this.store.selectedEmployee$
			.pipe(
				filter((employee) => !!employee),
				untilDestroyed(this)
			)
			.subscribe((employee) => {
				if (employee && employee.id) {
					this.selectedEmployee = employee;
				} else {
					this.selectedEmployee = null;
				}
				this.loadSmartTable();
				this.updateJobs$.next();
			});
		this.updateJobs$.next();
	}

	getProposalTemplates() {
		const request = {
			...this.proposalTemplateRequest,
			where: {
				...(this.selectedEmployee && this.selectedEmployee.id
					? { employeeId: this.selectedEmployee.id }
					: {})
			}
		};

		this.proposalTemplateService.getAll(request).then((data) => {
			this.smartTableSource.load(data.items);
		});
	}

	selectItem({ isSelected, data }) {
		this.disableButton = !isSelected;
		this.selectedItem = isSelected ? data : null;
	}

	loadSmartTable() {
		this.settingsSmartTable = {
			...this.settingsSmartTable,
			columns: {
				...(!this.selectedEmployee
					? {
							employeeIds: {
								title: this.getTranslation(
									'PROPOSAL_TEMPLATE.EMPLOYEE'
								),
								filter: false,
								width: '20%',
								type: 'custom',
								sort: false,
								renderComponent: AvatarComponent,
								valuePrepareFunction: (
									cell,
									row: IEmployeeProposalTemplate
								) => {
									return {
										name:
											row.employee && row.employee.user
												? row.employee.user.name
												: null,
										src:
											row.employee && row.employee.user
												? row.employee.user.imageUrl
												: null
									};
								}
							}
					  }
					: {}),
				name: {
					title: this.getTranslation('PROPOSAL_TEMPLATE.NAME'),
					type: 'text',
					width: '30%',
					filter: false,
					sort: false,
					valuePrepareFunction: (
						cell,
						row: IEmployeeProposalTemplate
					) => {
						return `${row.name.slice(0, 150)}`;
					}
				},
				content: {
					title: this.getTranslation('PROPOSAL_TEMPLATE.DESCRIPTION'),
					type: 'html',
					width: '40%',
					filter: false,
					sort: false,
					valuePrepareFunction: (
						cell,
						row: IEmployeeProposalTemplate
					) => {
						let value = this.nl2BrPipe.transform(row.content);
						value = this.truncatePipe.transform(value, 500);
						return value;
					}
				},
				isDefault: {
					title: this.getTranslation('PROPOSAL_TEMPLATE.IS_DEFAULT'),
					type: 'text',
					width: '10%',
					filter: false,
					sort: false,
					valuePrepareFunction: (
						cell,
						row: IEmployeeProposalTemplate
					) => {
						return row.isDefault ? 'Yes' : 'No';
					}
				}
			}
		};
	}

	createProposal(): void {
		this.dialogService
			.open(AddEditProposalTemplateComponent, {
				context: {
					selectedEmployee: this.selectedEmployee
				}
			})
			.onClose.pipe(untilDestroyed(this))
			.subscribe((resp) => {
				if (resp) {
					this.getProposalTemplates();
				}
			});
	}

	editProposal(): void {
		this.dialogService
			.open(AddEditProposalTemplateComponent, {
				context: {
					proposalTemplate: this.selectedItem,
					selectedEmployee: this.selectedEmployee
				}
			})
			.onClose.pipe(untilDestroyed(this))
			.subscribe((resp) => {
				if (resp) {
					this.getProposalTemplates();
				}
			});
	}

	deleteProposal(): void {
		this.proposalTemplateService.delete(this.selectedItem.id).then(() => {
			this.toastrService.success(
				this.getTranslation('PROPOSAL_TEMPLATE.PROPOSAL_DELETE_MESSAGE')
			);
			this.getProposalTemplates();
		});
	}

	makeDefault(): void {
		this.proposalTemplateService
			.makeDefault(this.selectedItem.id)
			.then(() => {
				this.toastrService.success(
					this.getTranslation(
						'PROPOSAL_TEMPLATE.PROPOSAL_MAKE_DEFAULT_MESSAGE'
					)
				);
				this.getProposalTemplates();
			});
	}

	ngOnDestroy(): void {}
}
