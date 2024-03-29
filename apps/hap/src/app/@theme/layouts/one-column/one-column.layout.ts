import {
	AfterViewInit,
	Component,
	Inject,
	PLATFORM_ID,
	ViewChild,
	OnInit
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
	NbLayoutComponent,
	NbLayoutDirectionService,
	NbLayoutDirection
} from '@nebular/theme';
import { UsersService } from '../../../@core/services/users.service';

import { WindowModeBlockScrollService } from '../../services/window-mode-block-scroll.service';
import { Store } from '../../../@core/services/store.service';
import { UsersOrganizationsService } from '../../../@core/services/users-organizations.service';
import { OrganizationsService } from '../../../@core/services/organizations.service';
import { first } from 'rxjs/operators';
import { EmployeesService } from '../../../@core/services';
import { PermissionsEnum } from '@hap/models';
import { NO_EMPLOYEE_SELECTED } from '../../components/header/selectors/employee/employee.component';
import { Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';

@Component({
	selector: 'ngx-one-column-layout',
	styleUrls: ['./one-column.layout.scss'],
	templateUrl: './one-column.layout.html'
})
export class OneColumnLayoutComponent implements OnInit, AfterViewInit {
	constructor(
		@Inject(PLATFORM_ID) private platformId,
		private windowModeBlockScrollService: WindowModeBlockScrollService,
		private usersService: UsersService,
		private usersOrganizationsService: UsersOrganizationsService,
		private organizationsService: OrganizationsService,
		private employeesService: EmployeesService,
		private store: Store,
		private directionService: NbLayoutDirectionService,
		private router: Router,
		private electronService: ElectronService
	) {}
	@ViewChild(NbLayoutComponent) layout: NbLayoutComponent;

	user: any;
	showOrganizationsSelector = false;
	showEmployeesSelector = false;
	loading = true;

	userMenu = [
		{ title: 'Profile', link: '/pages/auth/profile' },
		{ title: 'Log out', link: '/auth/logout' }
	];

	layout_direction: NbLayoutDirection = this.directionService.getDirection();
	sidebar_class = 'menu-sidebar';

	ngOnInit() {
		this.loadUserData();

		if (this.layout_direction === NbLayoutDirection.RTL) {
			this.sidebar_class = 'menu-sidebar-rtl';
		}
	}

	ngAfterViewInit() {
		if (isPlatformBrowser(this.platformId)) {
			this.windowModeBlockScrollService.register(this.layout);
		}
	}

	private async loadUserData() {
		const id = this.store.userId;
		if (!id) return;
		this.user = await this.usersService.getMe([
			'employee',
			'role',
			'role.rolePermissions',
			'tenant'
		]);

		try {
			if (this.electronService.isElectronApp) {
				this.electronService.ipcRenderer.send('auth_success', {
					token: this.store.token,
					userId: this.user.id,
					employeeId: this.user.employee
						? this.user.employee.id
						: null,
					organizationId: this.user.employee
						? this.user.employee.organizationId
						: null,
					tenantId: this.user.tenantId ? this.user.tenantId : null
				});
			}
		} catch (error) {}

		//When a new user registers & logs in for the first time, he/she does not have tenantId.
		//In this case, we redirect the user to the onboarding page to create their first organization, tenant, role.
		if (!this.user.tenantId) {
			this.router.navigate(['/onboarding/tenant']);
			return;
		}

		//only enabled permissions assign to logged in user
		this.store.userRolePermissions = this.user.role.rolePermissions.filter(
			(permission) => permission.enabled
		);
		this.store.user = this.user;

		if (
			this.store.hasPermission(
				PermissionsEnum.CHANGE_SELECTED_ORGANIZATION
			)
		) {
			this.showOrganizationsSelector = true;
		} else {
			const {
				items: userOrg
			} = await this.usersOrganizationsService.getAll([], {
				userId: id,
				tenantId: this.user.tenantId
			});
			const org = await this.organizationsService
				.getById(userOrg[0].organizationId)
				.pipe(first())
				.toPromise();
			this.store.selectedOrganization = org;
		}

		if (
			this.store.hasPermission(PermissionsEnum.CHANGE_SELECTED_EMPLOYEE)
		) {
			this.showEmployeesSelector = true;
			this.store.selectedEmployee = null;
		} else {
			const emp = await this.employeesService.getEmployeeById(
				this.user.employeeId,
				[]
			);
			if (emp) {
				this.store.selectedEmployee = {
					id: emp.id,
					firstName: this.user.firstName,
					lastName: this.user.lastName,
					imageUrl: this.user.imageUrl
				};
			} else {
				this.store.selectedEmployee = NO_EMPLOYEE_SELECTED;
			}
		}
		this.loading = false;
	}
}
