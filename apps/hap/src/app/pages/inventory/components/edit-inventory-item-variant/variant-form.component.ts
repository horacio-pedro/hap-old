import { Component, OnInit, OnDestroy } from '@angular/core';
import {
	CurrenciesEnum,
	BillingInvoicingPolicyEnum,
	IProductVariant,
	IOrganization
} from '@hap/models';
import { TranslationBaseComponent } from 'apps/hap/src/app/@shared/language-base/translation-base.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { NbToastrService } from '@nebular/theme';
import { ProductVariantService } from 'apps/hap/src/app/@core/services/product-variant.service';
import { ProductVariantPriceService } from 'apps/hap/src/app/@core/services/product-variant-price.service';
import { ProductVariantSettingsService } from 'apps/hap/src/app/@core/services/product-variant-settings.service';
import { Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Location } from '@angular/common';
import { Store } from 'apps/hap/src/app/@core/services/store.service';

export interface IOptionCreateInput {
	name: string;
	code: string;
}

export interface IVariantCreateInput {
	options: string[];
}

@Component({
	selector: 'ngx-inventory-variant-form',
	templateUrl: './variant-form.component.html',
	styleUrls: ['./variant-form.component.scss']
})
export class InventoryVariantFormComponent
	extends TranslationBaseComponent
	implements OnInit, OnDestroy {
	itemVariant: IProductVariant;
	hoverState: boolean;
	currencies = Object.values(CurrenciesEnum);
	billingInvoicingPolicies = Object.values(BillingInvoicingPolicyEnum);

	form: FormGroup;
	organization: IOrganization;
	private ngDestroy$ = new Subject<void>();

	constructor(
		translationService: TranslateService,
		private fb: FormBuilder,
		private toastrService: NbToastrService,
		private productVariantService: ProductVariantService,
		private productVariantPriceService: ProductVariantPriceService,
		private productVariantSettingsService: ProductVariantSettingsService,
		private location: Location,
		private route: ActivatedRoute,
		private readonly store: Store
	) {
		super(translationService);
	}

	ngOnInit(): void {
		this.store.selectedOrganization$
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe((organization: IOrganization) => {
				if (organization) {
					this.organization = organization;
				}
			});

		this.route.params
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe(async (params) => {
				this.itemVariant = params.itemVariantId
					? await this.productVariantService.getProductVariant(
							params.itemVariantId
					  )
					: null;

				this._initializeForm();
			});
	}

	ngOnDestroy(): void {
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}

	private _initializeForm() {
		this.form = this.fb.group({
			imageUrl: [],
			internationalReference: [
				this.itemVariant ? this.itemVariant.internalReference : '',
				[Validators.required]
			],
			invoicingPolicy: [
				this.itemVariant
					? this.itemVariant.billingInvoicingPolicy
					: BillingInvoicingPolicyEnum.QUANTITY_ORDERED,
				[Validators.required]
			],
			quantity: [
				this.itemVariant ? this.itemVariant.quantity : 0,
				[Validators.required, Validators.min(0)]
			],
			taxes: [
				this.itemVariant ? this.itemVariant.taxes : 0,
				[Validators.required, Validators.min(0)]
			],
			retailPrice: [
				this.itemVariant ? this.itemVariant.price.retailPrice : 0,
				[Validators.required, Validators.min(0)]
			],
			retailPriceCurrency: [
				this.itemVariant
					? this.itemVariant.price.retailPriceCurrency
					: CurrenciesEnum.USD,
				Validators.required
			],
			unitCost: [
				this.itemVariant ? this.itemVariant.price.unitCost : 0,
				[Validators.required, Validators.min(0)]
			],
			unitCostCurrency: [
				this.itemVariant
					? this.itemVariant.price.unitCostCurrency
					: CurrenciesEnum.USD,
				Validators.required
			],
			enabled: [
				this.itemVariant ? this.itemVariant.enabled : true,
				Validators.required
			],
			isSubscription: [
				this.itemVariant
					? this.itemVariant.settings.isSubscription
					: false
			],
			isPurchaseAutomatically: [
				this.itemVariant
					? this.itemVariant.settings.isPurchaseAutomatically
					: false
			],
			canBeSold: [
				this.itemVariant ? this.itemVariant.settings.canBeSold : true
			],
			canBePurchased: [
				this.itemVariant
					? this.itemVariant.settings.canBePurchased
					: true
			],
			canBeCharged: [
				this.itemVariant ? this.itemVariant.settings.canBeCharged : true
			],
			canBeRented: [
				this.itemVariant ? this.itemVariant.settings.canBeRented : false
			],
			trackInventory: [
				this.itemVariant
					? this.itemVariant.settings.trackInventory
					: false
			],
			isEquipment: [
				this.itemVariant ? this.itemVariant.settings.isEquipment : false
			],
			notes: [this.itemVariant ? this.itemVariant.notes : '']
		});
	}

	onCancel() {
		this.location.back();
	}

	onSaveRequest() {
		const { id: organizationId, tenantId } = this.organization;
		const formValue = this.form.value;

		const productVariantRequest = {
			itemVariant: {
				id: this.itemVariant.id,
				internalReference: formValue['internationalReference'],
				billingInvoicingPolicy: formValue['invoicingPolicy'],
				quantity: formValue['quantity'],
				taxes: formValue['taxes'],
				enabled: formValue['enabled'],
				notes: formValue['notes'],
				organizationId,
				tenantId
			},
			productVariantPrice: {
				id: this.itemVariant.price.id,
				retailPrice: formValue['retailPrice'],
				retailPriceCurrency: formValue['retailPriceCurrency'],
				unitCost: formValue['unitCost'],
				unitCostCurrency: formValue['unitCostCurrency'],
				organizationId,
				tenantId
			},
			productVariantSettings: {
				id: this.itemVariant.settings.id,
				isSubscription: formValue['isSubscription'],
				isPurchaseAutomatically: formValue['isPurchaseAutomatically'],
				canBeSold: formValue['canBeSold'],
				canBePurchased: formValue['canBePurchased'],
				canBeCharged: formValue['canBeCharged'],
				canBeRented: formValue['canBeRented'],
				trackInventory: formValue['trackInventory'],
				isEquipment: formValue['isEquipment'],
				organizationId,
				tenantId
			}
		};

		this.saveVariant(productVariantRequest);
	}

	async saveVariant(productVariantRequest: any) {
		try {
			await this.productVariantSettingsService.updateProductVariantSettings(
				productVariantRequest.productVariantSettings
			);

			await this.productVariantPriceService.updateProductVariantPrice(
				productVariantRequest.productVariantPrice
			);

			await this.productVariantService.updateProductVariant(
				productVariantRequest.itemVariant
			);

			this.toastrService.primary(
				this.getTranslation('INVENTORY_PAGE.PRODUCT_VARIANT_SAVED'),
				this.getTranslation('TOASTR.TITLE.SUCCESS')
			);

			this.location.back();
		} catch {
			this.toastrService.danger(
				this.getTranslation('TOASTR.TITLE.ERROR'),
				this.getTranslation('TOASTR.MESSAGE.SOMETHING_BAD_HAPPENED')
			);
		}
	}

	//tstodo
	handleImageUploadError(event: any) {}
}
