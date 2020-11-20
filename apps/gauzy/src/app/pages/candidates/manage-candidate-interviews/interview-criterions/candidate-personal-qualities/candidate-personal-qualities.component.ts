import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { NbToastrService } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { TranslationBaseComponent } from 'apps/gauzy/src/app/@shared/language-base/translation-base.component';
import { CandidatePersonalQualitiesService } from 'apps/gauzy/src/app/@core/services/candidate-personal-qualities.service';
import { ICandidatePersonalQualities, IOrganization } from '@gauzy/models';
import { Store } from 'apps/gauzy/src/app/@core/services/store.service';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'ga-candidate-personal-qualities',
	templateUrl: './candidate-personal-qualities.component.html',
	styleUrls: ['./candidate-personal-qualities.component.scss']
})
export class CandidatePersonalQualitiesComponent
	extends TranslationBaseComponent
	implements OnInit, OnDestroy {
	private _ngDestroy$ = new Subject<void>();
	personalQualitiesList: ICandidatePersonalQualities[];
	form: FormGroup;
	editId = null;
	existedQualNames: string[];
	qualityNames: string[] = [];
	organization: IOrganization;
	constructor(
		private fb: FormBuilder,
		private readonly toastrService: NbToastrService,
		readonly translateService: TranslateService,
		private candidatePersonalQualitiesService: CandidatePersonalQualitiesService,
		private readonly store: Store
	) {
		super(translateService);
	}

	ngOnInit() {
		this.store.selectedOrganization$
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((organization: IOrganization) => {
				if (organization) {
					this.organization = organization;
					this._initializeForm();
					this.loadQualities();
				}
			});
	}

	cancel() {
		(this.qualities as FormArray).reset();
	}

	private async _initializeForm() {
		this.form = new FormGroup({
			qualities: this.fb.array([])
		});
		const qualitiesForm = this.qualities as FormArray;
		qualitiesForm.push(
			this.fb.group({
				name: ['', Validators.required]
			})
		);
		this.form.valueChanges.subscribe((item) => {
			this.existedQualNames = [];
			const enteredName = item.qualities[0].name;
			this.personalQualitiesList.forEach((el) => {
				if (
					enteredName !== '' &&
					el.name.toLocaleLowerCase().includes(enteredName)
				) {
					this.existedQualNames.push(el.name);
				}
			});
		});
	}

	private async loadQualities() {
		const { id: organizationId, tenantId } = this.organization;
		const res = await this.candidatePersonalQualitiesService.getAll({
			organizationId,
			tenantId
		});
		if (res) {
			this.personalQualitiesList = res.items.filter(
				(item) => !item.interviewId
			);
			this.qualityNames = [];
			this.personalQualitiesList.forEach((tech) => {
				this.qualityNames.push(tech.name.toLocaleLowerCase());
			});
		}
	}
	async save() {
		const { id: organizationId, tenantId } = this.organization;
		const qualitiesForm = this.qualities as FormArray;
		const formValue = { ...qualitiesForm.value[0] };
		const targetValue = Object.assign(formValue, {
			organizationId,
			tenantId
		});

		if (this.editId !== null) {
			this.update(targetValue);
		} else {
			this.create(targetValue);
		}
		qualitiesForm.reset();
	}

	async update(formValue: ICandidatePersonalQualities) {
		if (!this.qualityNames.includes(formValue.name.toLocaleLowerCase())) {
			try {
				await this.candidatePersonalQualitiesService.update(
					this.editId,
					{
						...formValue
					}
				);
				this.editId = null;
				this.toastrSuccess('UPDATED');
				this.loadQualities();
			} catch (error) {
				this.toastrError(error);
			}
		} else {
			this.toastrService.danger(
				this.getTranslation(
					'CANDIDATES_PAGE.CRITERIONS.TOASTR_ALREADY_EXIST'
				),
				this.getTranslation('TOASTR.TITLE.ERROR')
			);
		}
	}

	async create(formValue: ICandidatePersonalQualities) {
		if (!this.qualityNames.includes(formValue.name.toLocaleLowerCase())) {
			try {
				await this.candidatePersonalQualitiesService.create({
					...formValue
				});
				this.toastrSuccess('CREATED');
				this.loadQualities();
			} catch (error) {
				this.toastrError(error);
			}
		} else {
			this.toastrService.danger(
				this.getTranslation(
					'CANDIDATES_PAGE.CRITERIONS.TOASTR_ALREADY_EXIST'
				),
				this.getTranslation('TOASTR.TITLE.ERROR')
			);
		}
	}

	async edit(index: number, id: string) {
		this.editId = id;
		this.form.controls.qualities.patchValue([
			this.personalQualitiesList[index]
		]);
	}
	async remove(id: string) {
		try {
			await this.candidatePersonalQualitiesService.delete(id);
			this.loadQualities();
			this.toastrSuccess('DELETED');
		} catch (error) {
			this.toastrError(error);
		}
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
	private toastrError(error) {
		this.toastrService.danger(
			this.getTranslation('NOTES.CANDIDATE.EXPERIENCE.ERROR', {
				error: error.error ? error.error.message : error.message
			}),
			this.getTranslation('TOASTR.TITLE.ERROR')
		);
	}
	private toastrSuccess(text: string) {
		this.toastrService.success(
			this.getTranslation('TOASTR.TITLE.SUCCESS'),
			this.getTranslation(`TOASTR.MESSAGE.CANDIDATE_EDIT_${text}`)
		);
	}

	/*
	 * Getter for candidate qualities form controls array
	 */
	get qualities(): FormArray {
		return this.form.get('qualities') as FormArray;
	}
}
