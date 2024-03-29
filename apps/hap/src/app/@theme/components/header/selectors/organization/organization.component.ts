import { Component, OnInit, OnDestroy } from '@angular/core';
import { IOrganization } from '@hap/models';
import { Store } from 'apps/hap/src/app/@core/services/store.service';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { UsersOrganizationsService } from 'apps/hap/src/app/@core/services/users-organizations.service';

@Component({
	selector: 'ga-organization-selector',
	templateUrl: './organization.component.html',
	styleUrls: ['./organization.component.scss']
})
export class OrganizationSelectorComponent implements OnInit, OnDestroy {
	organizations: IOrganization[];
	selectedOrganization: IOrganization;

	private _ngDestroy$ = new Subject<void>();

	constructor(
		private store: Store,
		private userOrganizationService: UsersOrganizationsService
	) {}

	ngOnInit() {
		this.loadOrganizationsId();
		this.loadOrganizations();
	}

	selectOrganiztion(organization: IOrganization) {
		if (organization) {
			this.store.selectedOrganization = organization;
			this.store.selectedEmployee = null;
		}
	}

	private async loadOrganizations(): Promise<void> {
		const tenantId = this.store.user.tenantId;
		const { items = [] } = await this.userOrganizationService.getAll(
			['organization'],
			{ userId: this.store.userId, tenantId }
		);

		this.organizations = items.map((userOrg) => userOrg.organization);

		if (this.organizations.length > 0 && !this.store.selectedOrganization) {
			// set first organizations as default
			this.store.selectedOrganization = this.organizations[0];
		}
	}

	private loadOrganizationsId() {
		this.store.selectedOrganization$
			.pipe(
				filter((organization) => !!organization),
				takeUntil(this._ngDestroy$)
			)
			.subscribe((organization: IOrganization) => {
				this.selectedOrganization = organization;
			});
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
