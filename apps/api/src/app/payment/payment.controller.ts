import { CrudController, IPagination } from '../core';
import { ApiTags } from '@nestjs/swagger';
import {
	Controller,
	UseGuards,
	Query,
	Get,
	HttpCode,
	HttpStatus,
	Put,
	Param,
	Body,
	Post,
	Delete
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Payment } from './payment.entity';
import { PaymentService } from './payment.service';
import { IPayment, PermissionsEnum } from '@hap/models';
import { ParseJsonPipe } from '../shared';
import { PermissionGuard } from '../shared/guards/auth/permission.guard';
import { Permissions } from '../shared/decorators/permissions';
import { TenantPermissionGuard } from '../shared/guards/auth/tenant-permission.guard';

@ApiTags('Payment')
@UseGuards(AuthGuard('jwt'), TenantPermissionGuard)
@Controller()
export class PaymentController extends CrudController<Payment> {
	constructor(private paymentService: PaymentService) {
		super(paymentService);
	}

	@HttpCode(HttpStatus.ACCEPTED)
	@UseGuards(PermissionGuard)
	@Permissions(PermissionsEnum.ORG_PAYMENT_VIEW)
	@Get()
	async findAllPayments(
		@Query('data', ParseJsonPipe) data: any
	): Promise<IPagination<IPayment>> {
		const { relations = [], findInput = null } = data;
		return this.paymentService.findAll({
			where: findInput,
			relations
		});
	}

	@HttpCode(HttpStatus.ACCEPTED)
	@UseGuards(PermissionGuard)
	@Permissions(PermissionsEnum.ORG_PAYMENT_ADD_EDIT)
	@Post()
	async createPayment(@Body() entity: IPayment): Promise<any> {
		return this.paymentService.create(entity);
	}

	@HttpCode(HttpStatus.ACCEPTED)
	@UseGuards(PermissionGuard)
	@Permissions(PermissionsEnum.ORG_PAYMENT_ADD_EDIT)
	@Put(':id')
	async updatePayment(
		@Param('id') id: string,
		@Body() entity: IPayment
	): Promise<any> {
		return this.paymentService.create({
			id,
			...entity
		});
	}

	@HttpCode(HttpStatus.ACCEPTED)
	@UseGuards(PermissionGuard)
	@Permissions(PermissionsEnum.ORG_PAYMENT_ADD_EDIT)
	@Delete(':id')
	async deleteTask(@Param('id') id: string): Promise<any> {
		return this.paymentService.delete(id);
	}
}
