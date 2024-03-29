import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IEmployeeProposalTemplate, IOrganization } from '@hap/models';
import { NbDialogRef } from '@nebular/theme';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from 'apps/hap/src/app/@core/services/store.service';
import { ToastrService } from 'apps/hap/src/app/@core/services/toastr.service';
import { SelectedEmployee } from 'apps/hap/src/app/@theme/components/header/selectors/employee/employee.component';
import { filter } from 'rxjs/operators';
import { ProposalTemplateService } from '../proposal-template.service';

@UntilDestroy()
@Component({
	selector: 'ga-add-edit-proposal-template',
	templateUrl: './add-edit-proposal-template.component.html',
	styleUrls: ['./add-edit-proposal-template.component.scss']
})
export class AddEditProposalTemplateComponent implements OnInit {
	mode: 'create' | 'update' = 'create';

	@Input() selectedEmployee: SelectedEmployee;
	@Input() proposalTemplate: IEmployeeProposalTemplate = {};
	form: FormGroup;
	organization: IOrganization;

	constructor(
		private dialogRef: NbDialogRef<AddEditProposalTemplateComponent>,
		private fb: FormBuilder,
		private proposalTemplateService: ProposalTemplateService,
		private toastrService: ToastrService,
		private store: Store
	) {}

	ngOnInit(): void {
		if (this.proposalTemplate && this.proposalTemplate.id) {
			this.mode = 'update';
		} else {
			this.mode = 'create';
		}
		this.form = this.fb.group({
			employeeId: [this.proposalTemplate.employeeId || ''],
			name: [this.proposalTemplate.name || ''],
			content: [this.proposalTemplate.content || '']
		});

		this.store.selectedOrganization$
			.pipe(
				filter((organization) => !!(organization && organization.id)),
				untilDestroyed(this)
			)
			.subscribe((organization) => {
				if (organization.id) {
					this.organization = organization;
				} else {
					this.organization = null;
				}
			});
	}

	close() {
		this.dialogRef.close();
	}

	onSave(): void {
		if (this.form.valid) {
			let resp: Promise<IEmployeeProposalTemplate>;
			const request = {
				...this.form.value,
				organizationId: this.organization.id,
				tenantId: this.organization.tenantId
			};
			if (this.selectedEmployee && this.selectedEmployee.id) {
				request.employeeId = this.selectedEmployee.id;
			}
			if (this.mode === 'create') {
				resp = this.proposalTemplateService.create(request);
			} else {
				resp = this.proposalTemplateService.update(
					this.proposalTemplate.id,
					{
						...request,
						employeeId: this.proposalTemplate.employeeId
					}
				);
			}

			resp.then((data) => {
				this.dialogRef.close(data);
			}).catch((error) => {
				this.toastrService.error(error);
			});
		}
	}
}
