import * as moment from 'moment';
import * as timezone from 'moment-timezone';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
	AlignmentOptions,
	DefaultValueDateTypeEnum,
	IOrganization,
	WeekDaysEnum,
	RegionsEnum,
	CurrenciesEnum,
	BonusTypeEnum,
	CurrencyPosition
} from '@hap/models';
import { NbToastrService } from '@nebular/theme';
import { OrganizationEditStore } from 'apps/hap/src/app/@core/services/organization-edit-store.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrganizationsService } from '../../../../../@core/services/organizations.service';
import { formatDate } from '@angular/common';
import { TranslationBaseComponent } from 'apps/hap/src/app/@shared/language-base/translation-base.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'ga-edit-org-other-settings',
	templateUrl: './edit-organization-other-settings.component.html',
	styleUrls: ['./edit-organization-other-settings.component.scss']
})
export class EditOrganizationOtherSettingsComponent
	extends TranslationBaseComponent
	implements OnInit, OnDestroy {
	private _ngDestroy$ = new Subject<void>();

	organization: IOrganization;
	form: FormGroup;

	defaultValueDateTypes: string[] = Object.values(DefaultValueDateTypeEnum);
	defaultAlignmentTypes: string[] = Object.values(AlignmentOptions).map(
		(type) => {
			return type[0] + type.substr(1, type.length).toLowerCase();
		}
	);
	defaultCurrencyPosition: string[] = Object.values(CurrencyPosition);
	defaultBonusTypes: string[] = Object.values(BonusTypeEnum);

	listOfZones = timezone.tz.names().filter((zone) => zone.includes('/'));
	// todo: maybe its better to place listOfDateFormats somewhere more global for the app?
	listOfDateFormats = ['L', 'L hh:mm', 'LL', 'LLL', 'LLLL'];
	numberFormats = ['USD', 'BGN', 'ILS'];
	numberFormat: string;
	weekdays: string[] = Object.values(WeekDaysEnum);
	currencies = Object.values(CurrenciesEnum);
	regionCodes = Object.keys(RegionsEnum);
	regionCode: string;
	regions = Object.values(RegionsEnum);

	constructor(
		private fb: FormBuilder,
		private organizationService: OrganizationsService,
		private toastrService: NbToastrService,
		private readonly organizationEditStore: OrganizationEditStore,
		readonly translateService: TranslateService
	) {
		super(translateService);
	}

	getTimeWithOffset(zone: string) {
		let cutZone = zone;
		if (zone.includes('/')) {
			cutZone = zone.split('/')[1];
		}

		const offset = timezone.tz(zone).format('zZ');

		return '(' + offset + ') ' + cutZone;
	}

	dateFormatPreview(format: string) {
		this.form.valueChanges
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((val) => {
				this.regionCode = val.regionCode;
			});

		moment.locale(this.regionCode);
		return moment().format(format);
	}

	numberFormatPreview(format: string) {
		const number = 12345.67;
		let code: string;
		switch (format) {
			case 'BGN':
				code = 'bg';
				break;
			case 'USD':
				code = 'en';
				break;
			case 'ILS':
				code = 'he';
				break;
		}
		return number.toLocaleString(`${code}`, {
			style: 'currency',
			currency: `${format}`,
			currencyDisplay: 'symbol'
		});
	}

	ngOnInit(): void {
		this.organizationEditStore.selectedOrganization$
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((organization) => {
				this.organization = organization;
				this._initializedForm();
			});
	}

	async updateOrganizationSettings() {
		this.organizationService.update(
			this.organization.id,
			this.form.getRawValue()
		);
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

	loadDefaultBonusPercentage(bonusType: BonusTypeEnum) {
		const bonusPercentageControl = this.form.get('bonusPercentage');

		switch (bonusType) {
			case BonusTypeEnum.PROFIT_BASED_BONUS:
				bonusPercentageControl.setValue(75);
				bonusPercentageControl.enable();
				break;
			case BonusTypeEnum.REVENUE_BASED_BONUS:
				bonusPercentageControl.setValue(10);
				bonusPercentageControl.enable();
				break;
			default:
				bonusPercentageControl.setValue(null);
				bonusPercentageControl.disable();
				break;
		}
	}
	private _initializedForm() {
		if (!this.organization) {
			return;
		}

		this.form = this.fb.group({
			defaultValueDateType: [
				this.organization.defaultValueDateType,
				Validators.required
			],
			regionCode: [this.organization.regionCode],
			defaultAlignmentType: [this.organization.defaultAlignmentType],
			brandColor: [this.organization.brandColor],
			dateFormat: [this.organization.dateFormat],
			timeZone: [this.organization.timeZone],
			startWeekOn: [this.organization.startWeekOn],
			numberFormat: [this.organization.numberFormat],
			bonusType: [this.organization.bonusType],
			bonusPercentage: [
				{
					value: this.organization.bonusPercentage,
					disabled: !this.organization.bonusType
				},
				[Validators.min(0), Validators.max(100)]
			],
			invitesAllowed: [this.organization.invitesAllowed || false],
			inviteExpiryPeriod: [
				{
					value: this.organization.inviteExpiryPeriod || 7,
					disabled: !this.organization.invitesAllowed
				},
				[Validators.min(1)]
			],
			fiscalStartDate: [
				formatDate(
					new Date(`01/01/${new Date().getFullYear()}`),
					'yyyy-MM-dd',
					'en'
				)
			],
			fiscalEndDate: [
				formatDate(
					new Date(`12/31/${new Date().getFullYear()}`),
					'yyyy-MM-dd',
					'en'
				)
			],
			futureDateAllowed: [this.organization.futureDateAllowed || false],
			allowManualTime: [this.organization.allowManualTime],
			allowModifyTime: [this.organization.allowModifyTime],
			allowDeleteTime: [this.organization.allowDeleteTime],
			requireReason: [this.organization.requireReason],
			requireDescription: [this.organization.requireDescription],
			requireProject: [this.organization.requireProject],
			requireTask: [this.organization.requireTask],
			requireClient: [this.organization.requireClient],
			timeFormat: [this.organization.timeFormat || 12],
			separateInvoiceItemTaxAndDiscount: [
				this.organization.separateInvoiceItemTaxAndDiscount
			],
			fiscalInformation: [this.organization.fiscalInformation || ''],
			currencyPosition: [this.organization.currencyPosition || 'LEFT'],
			discountAfterTax: [this.organization.discountAfterTax]
		});
	}

	toggleSeparateTaxing($event) {
		this.organization.separateInvoiceItemTaxAndDiscount = $event;
	}

	toggleExpiry(checked) {
		const inviteExpiryControl = this.form.get('inviteExpiryPeriod');
		checked ? inviteExpiryControl.enable() : inviteExpiryControl.disable();
	}

	toggleDiscountAfterTax($event) {
		this.organization.discountAfterTax = $event;
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
