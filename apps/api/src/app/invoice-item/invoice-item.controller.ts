import { CrudController, IPagination } from '../core';
import { InvoiceItem } from './invoice-item.entity';
import { InvoiceItemService } from './invoice-item.service';
import { ApiTags } from '@nestjs/swagger';
import { Controller, UseGuards, Get, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IInvoiceItem } from '@hap/models';
import { ParseJsonPipe } from '../shared';
import { TenantPermissionGuard } from '../shared/guards/auth/tenant-permission.guard';

@ApiTags('InvoiceItem')
@UseGuards(AuthGuard('jwt'), TenantPermissionGuard)
@Controller()
export class InvoiceItemController extends CrudController<InvoiceItem> {
	constructor(private invoiceItemService: InvoiceItemService) {
		super(invoiceItemService);
	}

	@Get()
	async findAllInvoiceItems(
		@Query('data', ParseJsonPipe) data: any
	): Promise<IPagination<IInvoiceItem>> {
		const { relations = [], findInput = null } = data;

		return this.invoiceItemService.findAll({
			where: findInput,
			relations
		});
	}
}
