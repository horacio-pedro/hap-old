import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Store } from 'apps/hap/src/app/@core/services/store.service';
import {
	IOrganizationDocument,
	ComponentLayoutStyleEnum,
	IOrganization
} from '@hap/models';
import { ToastrService } from 'apps/hap/src/app/@core/services/toastr.service';
import { OrganizationDocumentsService } from 'apps/hap/src/app/@core/services/organization-documents.service';
import { Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';
import { NbDialogService } from '@nebular/theme';
import { DeleteConfirmationComponent } from 'apps/hap/src/app/@shared/user/forms/delete-confirmation/delete-confirmation.component';
import { UploadDocumentComponent } from './upload-document/upload-document.component';
import { ComponentEnum } from '../../@core/constants/layout.constants';
import { TranslationBaseComponent } from '../../@shared/language-base/translation-base.component';
import { TranslateService } from '@ngx-translate/core';
import { LocalDataSource } from 'ng2-smart-table';
import { DocumentUrlTableComponent } from '../../@shared/table-components/document-url/document-url.component';
import { DocumentDateTableComponent } from '../../@shared/table-components/document-date/document-date.component';

@Component({
	selector: 'ga-documents',
	templateUrl: './documents.component.html'
})
export class DocumentsComponent
	extends TranslationBaseComponent
	implements OnInit, OnDestroy {
	@ViewChild('uploadDoc')
	uploadDoc: UploadDocumentComponent;
	organizationId: string;
	form: FormGroup;
	formDocument: FormGroup;
	documentUrl = '';
	documentId = null;
	documentList: IOrganizationDocument[];
	showAddCard = false;
	loading = false;
	settingsSmartTable: object;
	smartTableSource = new LocalDataSource();
	viewComponentName: ComponentEnum;
	dataLayoutStyle = ComponentLayoutStyleEnum.TABLE;
	selectedOrganization: IOrganization;
	private _ngDestroy$ = new Subject<void>();
	constructor(
		private readonly fb: FormBuilder,
		private dialogService: NbDialogService,
		private store: Store,
		readonly translateService: TranslateService,
		private organizationDocumentsService: OrganizationDocumentsService,
		private toastrService: ToastrService
	) {
		super(translateService);
		this.setView();
	}

	ngOnInit() {
		this.store.selectedOrganization$
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((org) => {
				if (org) {
					this.selectedOrganization = org;
					this._initializeForm();
					this._loadDocuments();
					this.loadSmartTable();
					this._applyTranslationOnSmartTable();
				}
			});
	}

	private _initializeForm() {
		this.form = new FormGroup({
			documents: this.fb.array([])
		});
		const documentForm = this.form.controls.documents as FormArray;
		documentForm.push(
			this.fb.group({
				name: ['', Validators.required],
				documentUrl: ['', Validators.required]
			})
		);
	}
	setView() {
		this.viewComponentName = ComponentEnum.DOCUMENTS;
		this.store
			.componentLayout$(this.viewComponentName)
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((componentLayout) => {
				this.dataLayoutStyle = componentLayout;
			});
	}
	async loadSmartTable() {
		this.settingsSmartTable = {
			actions: false,
			columns: {
				name: {
					title: this.getTranslation('ORGANIZATIONS_PAGE.NAME'),
					type: 'string'
				},
				documentUrl: {
					title: this.getTranslation(
						'ORGANIZATIONS_PAGE.DOCUMENT_URL'
					),
					type: 'custom',
					renderComponent: DocumentUrlTableComponent
				},
				updated: {
					title: this.getTranslation('ORGANIZATIONS_PAGE.UPDATED'),
					type: 'custom',
					renderComponent: DocumentDateTableComponent
				}
			}
		};
	}

	submitForm() {
		const documentForm = this.form.controls.documents as FormArray;
		const formValue = { ...documentForm.value[0] };
		this.formDocument = this.uploadDoc.form;
		formValue.documentUrl = this.formDocument.get('docUrl').value;

		if (this.documentId !== null) {
			formValue.documentUrl =
				formValue.documentUrl === ''
					? this.documentUrl
					: formValue.documentUrl;

			if (formValue.name !== '') {
				this._updateDocument(formValue);
			} else {
				this.toastrService.error('TOASTR.MESSAGE.ERRORS');
			}
		} else {
			if (formValue.documentUrl !== '' && formValue.name !== '') {
				this._createDocument(formValue);
			} else {
				this.toastrService.error('TOASTR.MESSAGE.ERRORS');
			}
		}
	}

	private _createDocument(formValue: IOrganizationDocument) {
		this.organizationDocumentsService
			.create({
				...formValue,
				organizationId: this.selectedOrganization.id,
				tenantId: this.selectedOrganization.tenantId
			})
			.pipe(takeUntil(this._ngDestroy$), first())
			.subscribe(
				() => {
					this.toastrService.success(
						'NOTES.ORGANIZATIONS.EDIT_ORGANIZATION_DOCS.CREATED'
					);
					this.cancel();
					this._loadDocuments();
				},
				() =>
					this.toastrService.error(
						'NOTES.ORGANIZATIONS.EDIT_ORGANIZATION_DOCS.ERR_CREATE'
					)
			);
	}

	private _loadDocuments() {
		this.loading = true;
		this.organizationDocumentsService
			.getAll({
				organizationId: this.selectedOrganization.id,
				tenantId: this.selectedOrganization.tenantId
			})
			.pipe(takeUntil(this._ngDestroy$), first())
			.subscribe(
				(data) => {
					this.documentList = data.items;
					this.smartTableSource.load(data.items);
					this.loading = false;
				},
				() =>
					this.toastrService.error(
						'NOTES.ORGANIZATIONS.EDIT_ORGANIZATION_DOCS.ERR_LOAD'
					)
			);
	}

	private _updateDocument(formValue: IOrganizationDocument) {
		this.organizationDocumentsService
			.update(this.documentId, { ...formValue })
			.pipe(takeUntil(this._ngDestroy$), first())
			.subscribe(
				() => {
					this.toastrService.success(
						'NOTES.ORGANIZATIONS.EDIT_ORGANIZATION_DOCS.UPDATED'
					);
					this.cancel();
					this._loadDocuments();
				},
				() =>
					this.toastrService.error(
						'NOTES.ORGANIZATIONS.EDIT_ORGANIZATION_DOCS.ERR_UPDATED'
					)
			);
	}

	showCard() {
		this.showAddCard = !this.showAddCard;
		this.form.controls.documents.reset();
	}

	editDocument(document: IOrganizationDocument) {
		this.showAddCard = !this.showAddCard;
		this.form.controls.documents.patchValue([document]);
		this.documentId = document.id;
		this.documentUrl = document.documentUrl;
	}

	removeDocument(id: string) {
		this.dialogService
			.open(DeleteConfirmationComponent, {
				context: {
					recordType:
						'NOTES.ORGANIZATIONS.EDIT_ORGANIZATION_DOCS.SELECTED_DOC'
				}
			})
			.onClose.pipe(first())
			.subscribe((res) => {
				if (res) {
					this.organizationDocumentsService
						.delete(id)
						.pipe(first())
						.subscribe(
							() => {
								this.toastrService.success(
									'NOTES.ORGANIZATIONS.EDIT_ORGANIZATION_DOCS.DELETED'
								);
								this._loadDocuments();
							},
							() =>
								'NOTES.ORGANIZATIONS.EDIT_ORGANIZATION_DOCS.ERR_DELETED'
						);
				}
			});
	}

	cancel() {
		this.showAddCard = !this.showAddCard;
		this.form.reset();
		this.documentUrl = null;
	}

	_applyTranslationOnSmartTable() {
		this.translateService.onLangChange
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe(() => {
				this.loadSmartTable();
			});
	}

	ngOnDestroy(): void {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
