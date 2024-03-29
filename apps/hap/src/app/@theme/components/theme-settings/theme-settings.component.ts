import { Component, OnInit, OnDestroy } from '@angular/core';
import {
	NbThemeService,
	NbLayoutDirectionService,
	NbLayoutDirection
} from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '../../../@core/services/store.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LanguagesEnum, IUser, ComponentLayoutStyleEnum } from '@hap/models';
import { LanguagesService } from '../../../@core/services/languages.service';
import { UsersService } from '../../../@core/services';

@Component({
	selector: 'ngx-theme-settings',
	styleUrls: ['./theme-settings.component.scss'],
	templateUrl: './theme-settings.component.html'
})
export class ThemeSettingsComponent implements OnInit, OnDestroy {
	themes = [
		{
			value: 'default',
			name: 'SETTINGS_MENU.LIGHT'
		},
		{
			value: 'dark',
			name: 'SETTINGS_MENU.DARK'
		},
		{
			value: 'cosmic',
			name: 'SETTINGS_MENU.COSMIC'
		},
		{
			value: 'corporate',
			name: 'SETTINGS_MENU.CORPORATE'
		}
	];
	componentLayouts = Object.keys(ComponentLayoutStyleEnum);

	languages = [];
	languagesEnum = {};

	currentTheme = 'default';
	currentLang: string = LanguagesEnum.ENGLISH;
	currentLayout: string = ComponentLayoutStyleEnum.TABLE;

	currentUser: IUser;

	private _ngDestroy$ = new Subject<void>();

	constructor(
		private themeService: NbThemeService,
		private translate: TranslateService,
		private directionService: NbLayoutDirectionService,
		private store: Store,
		private readonly languagesService: LanguagesService,
		private readonly userService: UsersService
	) {}

	async ngOnInit() {
		this.store.systemLanguages$
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((systemLanguages) => {
				if (systemLanguages && systemLanguages.length > 0) {
					this.languages = systemLanguages.map((item) => {
						return {
							value: item.code,
							name: 'SETTINGS_MENU.' + item.name.toUpperCase()
						};
					});
				}
			});

		this.store.user$.pipe(takeUntil(this._ngDestroy$)).subscribe((user) => {
			if (user) {
				this.currentUser = user;
				if (
					user.preferredLanguage &&
					user.preferredLanguage !== this.currentLang
				) {
					this.currentLang = this.currentUser.preferredLanguage;
				}
				this.switchLanguage();
				if (
					user.preferredComponentLayout &&
					user.preferredComponentLayout !== this.currentLayout
				) {
					this.currentLayout = user.preferredComponentLayout;
				}
				this.switchComponentLayout();
			}
		});

		this.store.preferredLanguage$
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((preferredLanguage) => {
				if (
					preferredLanguage &&
					preferredLanguage !== this.currentLang
				) {
					this.currentLang = preferredLanguage;
					this.switchLanguage();
				}
			});

		this.store.preferredComponentLayout$
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((preferredLayout) => {
				if (preferredLayout && preferredLayout !== this.currentLayout) {
					this.currentLayout = preferredLayout;
				}
			});
	}

	toggleTheme() {
		this.themeService.changeTheme(this.currentTheme);
	}

	switchLanguage() {
		if (this.currentLang === LanguagesEnum['HEBREW']) {
			this.directionService.setDirection(NbLayoutDirection.RTL);
		} else {
			this.directionService.setDirection(NbLayoutDirection.LTR);
		}

		this.store.preferredLanguage = this.currentLang;
		const updatedUserData = {
			preferredLanguage: this.store.preferredLanguage
		};
		this.updateUser(updatedUserData);
		if (
			this.currentLang !== this.translate.currentLang &&
			!!this.store.systemLanguages.find(
				(item) => item.code === this.currentLang
			)
		) {
			this.translate.use(this.currentLang);
		}
	}

	switchComponentLayout(selectedStyle?: ComponentLayoutStyleEnum) {
		this.store.preferredComponentLayout =
			selectedStyle || this.currentLayout;

		this.updateUser({
			preferredComponentLayout: selectedStyle || this.currentLayout
		});
	}

	resetLayoutForAllComponents() {
		this.store.componentLayout = [];
	}

	private async updateUser(updatedUserData: any) {
		try {
			await this.userService.update(this.currentUser.id, updatedUserData);
		} catch (error) {}
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
