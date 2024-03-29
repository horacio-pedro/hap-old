import { Component, OnDestroy, OnInit } from '@angular/core';
import {
	IOrganization,
	PermissionGroups,
	IRolePermission,
	RolesEnum,
	IUser
} from '@hap/models';
import { NbToastrService } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { RolePermissionsService } from '../../../@core/services/role-permissions.service';
import { RoleService } from '../../../@core/services/role.service';
import { Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';
import { TranslationBaseComponent } from '../../../@shared/language-base/translation-base.component';
import { Store } from '../../../@core/services/store.service';

@Component({
	selector: 'ga-edit-org-roles-permissions',
	templateUrl: './edit-roles-permissions.component.html',
	styleUrls: ['./edit-roles-permissions.component.scss']
})
export class EditRolesPermissionsComponent
	extends TranslationBaseComponent
	implements OnInit, OnDestroy {
	private _ngDestroy$ = new Subject<void>();
	private currentUser: IUser;

	organization: IOrganization;

	adminRole: RolesEnum = RolesEnum.ADMIN;
	selectedRole: RolesEnum = RolesEnum.EMPLOYEE;
	superAdminRole: RolesEnum = RolesEnum.SUPER_ADMIN;
	selectedRoleId: string;

	allRoles: string[] = Object.values(RolesEnum);

	loading = true;

	permissionGroups = PermissionGroups;

	enabledPermissions = {};
	allPermissions: IRolePermission[] = [];

	constructor(
		readonly translateService: TranslateService,
		private readonly toastrService: NbToastrService,
		private readonly rolePermissionsService: RolePermissionsService,
		private readonly rolesService: RoleService,
		private readonly store: Store
	) {
		super(translateService);
	}

	ngOnInit(): void {
		this.store.user$.pipe(takeUntil(this._ngDestroy$)).subscribe((user) => {
			this.currentUser = user;
			if (this.currentUser && this.currentUser.tenant) {
				this.loadPermissionsForSelectedRole();
			}
		});
	}

	async updateOrganizationSettings() {
		this.toastrService.primary(
			this.organization.name + ' organization settings updated.',
			'Success'
		);
		this.goBack();
	}

	goBack() {
		const currentURL = window.location.href;
		window.location.href = currentURL.substring(
			0,
			currentURL.indexOf('/settings')
		);
	}

	async loadPermissionsForSelectedRole() {
		this.enabledPermissions = {};
		this.loading = true;
		const role = await this.rolesService
			.getRoleByName({
				name: this.selectedRole,
				tenant: this.currentUser.tenant
			})
			.pipe(first())
			.toPromise();

		this.selectedRoleId = role.id;

		await this.refreshPermissions();

		this.loading = false;
	}

	async refreshPermissions() {
		const tenantId = this.currentUser.tenantId;
		const { items } = await this.rolePermissionsService.getRolePermissions({
			roleId: this.selectedRoleId,
			tenantId
		});

		items.forEach((p) => {
			this.enabledPermissions[p.permission] = p.enabled;
		});

		this.allPermissions = items;
	}

	async permissionChanged(permission, enabled) {
		try {
			const permissionToEdit = this.allPermissions.find(
				(p) => p.permission === permission
			);

			permissionToEdit && permissionToEdit.id
				? await this.rolePermissionsService.update(
						permissionToEdit.id,
						{
							enabled
						}
				  )
				: await this.rolePermissionsService.create({
						roleId: this.selectedRoleId,
						permission,
						enabled,
						tenant: this.store.user.tenant
				  });

			await this.refreshPermissions();

			this.toastrService.success(
				this.getTranslation('TOASTR.MESSAGE.PERMISSION_UPDATED', {
					permissionName: this.getTranslation(
						'ORGANIZATIONS_PAGE.PERMISSIONS.' + permission
					),
					roleName: this.getTranslation(
						'USERS_PAGE.ROLE.' + this.selectedRole
					)
				}),
				this.getTranslation('TOASTR.TITLE.SUCCESS')
			);
		} catch (error) {
			this.toastrService.danger(
				this.getTranslation('TOASTR.MESSAGE.PERMISSION_UPDATE_ERROR'),
				this.getTranslation('TOASTR.TITLE.ERROR')
			);
		}
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
