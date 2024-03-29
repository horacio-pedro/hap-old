import { Component } from '@angular/core';
import { NbDialogRef, NbToastrService } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { TranslationBaseComponent } from '../../../@shared/language-base/translation-base.component';
import { IInvoice, InvoiceTypeEnum } from '@hap/models';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { EmployeesService } from '../../../@core/services';
import { OrganizationProjectsService } from '../../../@core/services/organization-projects.service';
import { TasksService } from '../../../@core/services/tasks.service';
import { ProductService } from '../../../@core/services/product.service';
import { generatePdf } from '../../../@shared/invoice/generate-pdf';
import { ExpensesService } from '../../../@core/services/expenses.service';
import { InvoiceEstimateHistoryService } from '../../../@core/services/invoice-estimate-history.service';
import { Store } from '../../../@core/services/store.service';

@Component({
	selector: 'ga-invoice-send',
	templateUrl: './invoice-download-mutation.component.html'
})
export class InvoiceDownloadMutationComponent extends TranslationBaseComponent {
	invoice: IInvoice;
	isEstimate: boolean;
	tableBody: any;

	constructor(
		protected dialogRef: NbDialogRef<InvoiceDownloadMutationComponent>,
		readonly translateService: TranslateService,
		private toastrService: NbToastrService,
		private employeeService: EmployeesService,
		private projectService: OrganizationProjectsService,
		private taskService: TasksService,
		private productService: ProductService,
		private expensesService: ExpensesService,
		private invoiceEstimateHistoryService: InvoiceEstimateHistoryService,
		private store: Store
	) {
		super(translateService);
	}

	async closeDialog() {
		this.dialogRef.close();
	}

	async download() {
		pdfMake.vfs = pdfFonts.pdfMake.vfs;
		let docDefinition;
		let service;

		switch (this.invoice.invoiceType) {
			case InvoiceTypeEnum.BY_EMPLOYEE_HOURS:
				service = this.employeeService;
				break;
			case InvoiceTypeEnum.BY_PROJECT_HOURS:
				service = this.projectService;
				break;
			case InvoiceTypeEnum.BY_TASK_HOURS:
				service = this.taskService;
				break;
			case InvoiceTypeEnum.BY_PRODUCTS:
				service = this.productService;
				break;
			case InvoiceTypeEnum.BY_EXPENSES:
				service = this.expensesService;
				break;
			default:
				break;
		}

		docDefinition = await generatePdf(
			this.invoice,
			this.invoice.fromOrganization,
			this.invoice.toContact,
			service
		);

		pdfMake
			.createPdf(docDefinition)
			.download(
				`${this.isEstimate ? 'Estimate' : 'Invoice'}-${
					this.invoice.invoiceNumber
				}.pdf`
			);

		this.dialogRef.close();

		await this.invoiceEstimateHistoryService.add({
			action: this.isEstimate
				? 'Estimate downloaded'
				: 'Invoice downloaded',
			invoice: this.invoice,
			invoiceId: this.invoice.id,
			user: this.store.user,
			userId: this.store.userId,
			organization: this.invoice.fromOrganization,
			organizationId: this.invoice.fromOrganization.id,
			tenantId: this.invoice.fromOrganization.tenantId
		});

		this.toastrService.primary(
			this.isEstimate
				? this.getTranslation(
						'INVOICES_PAGE.DOWNLOAD.ESTIMATE_DOWNLOAD'
				  )
				: this.getTranslation(
						'INVOICES_PAGE.DOWNLOAD.INVOICE_DOWNLOAD'
				  ),
			this.getTranslation('TOASTR.TITLE.SUCCESS')
		);
	}
}
