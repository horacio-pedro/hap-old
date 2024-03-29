import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { TranslationBaseComponent } from '../../@shared/language-base/translation-base.component';
import { TranslateService } from '@ngx-translate/core';
import {
	IApprovalPolicy,
	ComponentLayoutStyleEnum,
	IRolePermission
} from '@hap/models';
import { LocalDataSource, Ng2SmartTableComponent } from 'ng2-smart-table';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { first, filter, tap } from 'rxjs/operators';
import { Store } from '../../@core/services/store.service';
import { ApprovalPolicyMutationComponent } from '../../@shared/approval-policy/approval-policy-mutation.component';
import { ApprovalPolicyService } from '../../@core/services/approval-policy.service';
import { DeleteConfirmationComponent } from '../../@shared/user/forms/delete-confirmation/delete-confirmation.component';
import { ComponentEnum } from '../../@core/constants/layout.constants';
import { Router, RouterEvent, NavigationEnd } from '@angular/router';
import { NgxPermissionsService } from 'ngx-permissions';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
@UntilDestroy({ checkProperties: true })
@Component({
	selector: 'ngx-approval-policy',
	templateUrl: './approval-policy.component.html',
	styleUrls: ['./approval-policy.component.scss']
})
export class ApprovalPolicyComponent
	extends TranslationBaseComponent
	implements OnInit, OnDestroy {
	public settingsSmartTable: object;
	public loading: boolean;
	public selectedApprovalPolicy: IApprovalPolicy;
	public disableButton = true;
	public smartTableSource = new LocalDataSource();
	approvalData: IApprovalPolicy[];
	viewComponentName: ComponentEnum;
	dataLayoutStyle = ComponentLayoutStyleEnum.TABLE;
	private selectedOrganizationId: string;
	private selectedTenantId: string;

	approvalPolicyTable: Ng2SmartTableComponent;
	@ViewChild('approvalPolicyTable') set content(
		content: Ng2SmartTableComponent
	) {
		if (content) {
			this.approvalPolicyTable = content;
			this.onChangedSource();
		}
	}

	constructor(
		readonly translateService: TranslateService,
		private store: Store,
		private dialogService: NbDialogService,
		private toastrService: NbToastrService,
		private approvalPolicyService: ApprovalPolicyService,
		private router: Router,
		private ngxPermissionsService: NgxPermissionsService
	) {
		super(translateService);
		this.setView();
	}

	ngOnInit() {
		this.store.userRolePermissions$
			.pipe(
				filter(
					(permissions: IRolePermission[]) => permissions.length > 0
				),
				untilDestroyed(this)
			)
			.subscribe((data) => {
				const permissions = data.map(({ permission }) => permission);
				this.ngxPermissionsService.loadPermissions(permissions);
			});
		this.store.selectedOrganization$
			.pipe(
				filter((organization) => !!organization),
				untilDestroyed(this)
			)
			.subscribe((org) => {
				if (org) {
					this.selectedOrganizationId = org.id;
					this.selectedTenantId = this.store.user.tenantId;
					this.loadSettings();
				}
			});
		this.router.events
			.pipe(untilDestroyed(this))
			.subscribe((event: RouterEvent) => {
				if (event instanceof NavigationEnd) {
					this.setView();
				}
			});
		this.loadSmartTable();
		this._applyTranslationOnSmartTable();
	}

	setView() {
		this.viewComponentName = ComponentEnum.APPROVAL_POLICY;
		this.store
			.componentLayout$(this.viewComponentName)
			.pipe(untilDestroyed(this))
			.subscribe((componentLayout) => {
				this.dataLayoutStyle = componentLayout;
			});
	}

	/*
	 * Table on changed source event
	 */
	onChangedSource() {
		this.approvalPolicyTable.source.onChangedSource
			.pipe(
				untilDestroyed(this),
				tap(() => this.clearItem())
			)
			.subscribe();
	}

	async loadSettings() {
		this.loading = true;
		let findInput: IApprovalPolicy = {};
		if (this.selectedOrganizationId) {
			findInput = {
				organizationId: this.selectedOrganizationId,
				tenantId: this.selectedTenantId
			};
		}
		const items = (
			await this.approvalPolicyService.getAll(['organization'], findInput)
		).items;
		this.loading = false;
		this.approvalData = items;
		this.smartTableSource.load(items);
	}

	async loadSmartTable() {
		this.settingsSmartTable = {
			actions: false,
			columns: {
				name: {
					title: this.getTranslation(
						'APPROVAL_POLICY_PAGE.APPROVAL_POLICY_NAME'
					),
					type: 'string'
				},
				description: {
					title: this.getTranslation(
						'APPROVAL_POLICY_PAGE.APPROVAL_POLICY_DESCRIPTION'
					),
					type: 'string',
					filter: false
				}
			}
		};
	}
	_applyTranslationOnSmartTable() {
		this.translateService.onLangChange
			.pipe(untilDestroyed(this))
			.subscribe(() => {
				this.loadSmartTable();
			});
	}

	async save(selectedItem?: IApprovalPolicy) {
		if (selectedItem) {
			this.selectApprovalPolicy({
				isSelected: true,
				data: selectedItem
			});
		}
		const dialog = this.dialogService.open(
			ApprovalPolicyMutationComponent,
			{
				context: {
					approvalPolicy: this.selectedApprovalPolicy,
					organizationId: this.selectedOrganizationId,
					tenantId: this.selectedTenantId
				}
			}
		);
		const requestApproval = await dialog.onClose.pipe(first()).toPromise();
		if (requestApproval) {
			this.toastrService.primary(
				this.getTranslation('EQUIPMENT_PAGE.EQUIPMENT_SAVED'),
				this.getTranslation('TOASTR.TITLE.SUCCESS')
			);
		}
		this.clearItem();
		this.loadSettings();
	}

	async selectApprovalPolicy({ isSelected, data }) {
		this.disableButton = !isSelected;
		this.selectedApprovalPolicy = isSelected ? data : null;
	}

	async delete(selectedItem?: IApprovalPolicy) {
		if (selectedItem) {
			this.selectApprovalPolicy({
				isSelected: true,
				data: selectedItem
			});
		}
		const result = await this.dialogService
			.open(DeleteConfirmationComponent)
			.onClose.pipe(first())
			.toPromise();

		if (result) {
			await this.approvalPolicyService.delete(
				this.selectedApprovalPolicy.id
			);
			this.loadSettings();
			this.toastrService.primary(
				this.getTranslation('EQUIPMENT_SHARING_PAGE.REQUEST_DELETED'),
				this.getTranslation('TOASTR.TITLE.SUCCESS')
			);
		}
		this.clearItem();
	}

	/*
	 * Clear selected item
	 */
	clearItem() {
		this.selectApprovalPolicy({
			isSelected: false,
			data: null
		});
		this.deselectAll();
	}

	/*
	 * Deselect all table rows
	 */
	deselectAll() {
		if (this.approvalPolicyTable && this.approvalPolicyTable.grid) {
			this.approvalPolicyTable.grid.dataSet['willSelect'] = 'false';
			this.approvalPolicyTable.grid.dataSet.deselectAll();
		}
	}

	ngOnDestroy() {}
}
