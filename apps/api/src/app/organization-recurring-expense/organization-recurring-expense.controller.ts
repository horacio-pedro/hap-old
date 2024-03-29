import {
	IStartUpdateTypeInfo,
	IOrganizationRecurringExpenseForEmployeeOutput,
	IRecurringExpenseEditInput
} from '@hap/models';
import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Post,
	Put,
	Query,
	UseGuards
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IPagination } from '../core';
import { CrudController } from '../core/crud/crud.controller';
import { TenantPermissionGuard } from '../shared/guards/auth/tenant-permission.guard';
import { OrganizationRecurringExpenseCreateCommand } from './commands/organization-recurring-expense.create.command';
import { OrganizationRecurringExpenseDeleteCommand } from './commands/organization-recurring-expense.delete.command';
import { OrganizationRecurringExpenseEditCommand } from './commands/organization-recurring-expense.edit.command';
import { OrganizationRecurringExpense } from './organization-recurring-expense.entity';
import { OrganizationRecurringExpenseService } from './organization-recurring-expense.service';
import { OrganizationRecurringExpenseByMonthQuery } from './queries/organization-recurring-expense.by-month.query';
import { OrganizationRecurringExpenseFindSplitExpenseQuery } from './queries/organization-recurring-expense.find-split-expense.query';
import { OrganizationRecurringExpenseStartDateUpdateTypeQuery } from './queries/organization-recurring-expense.update-type.query';

@ApiTags('OrganizationRecurringExpense')
@UseGuards(AuthGuard('jwt'), TenantPermissionGuard)
@Controller()
export class OrganizationRecurringExpenseController extends CrudController<
	OrganizationRecurringExpense
> {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus,
		private readonly organizationRecurringExpenseService: OrganizationRecurringExpenseService
	) {
		super(organizationRecurringExpenseService);
	}

	@ApiOperation({ summary: 'Create new expense' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'The expense has been successfully created.'
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description:
			'Invalid input, The response body may contain clues as to what went wrong'
	})
	@HttpCode(HttpStatus.CREATED)
	@Post()
	async create(
		@Body() entity: OrganizationRecurringExpense
	): Promise<OrganizationRecurringExpense> {
		return this.commandBus.execute(
			new OrganizationRecurringExpenseCreateCommand(entity)
		);
	}

	@ApiOperation({ summary: 'Delete record' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'The record has been successfully deleted'
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Record not found'
	})
	@HttpCode(HttpStatus.ACCEPTED)
	@Delete(':id')
	async delete(
		@Param('id') id: string,
		@Query('data') data: string
	): Promise<any> {
		const { deleteInput } = JSON.parse(data);

		return this.commandBus.execute(
			new OrganizationRecurringExpenseDeleteCommand(id, deleteInput)
		);
	}

	@ApiOperation({
		summary: 'Find all organization recurring expenses.'
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Found organization recurring expense',
		type: OrganizationRecurringExpense
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Record not found'
	})
	@Get()
	async findAllRecurringExpenses(
		@Query('data') data: string
	): Promise<IPagination<OrganizationRecurringExpense>> {
		const { findInput, order = {} } = JSON.parse(data);

		return this.organizationRecurringExpenseService.findAll({
			where: findInput,
			order: order
		});
	}

	@ApiOperation({
		summary:
			'Find all organization recurring expenses for given employee, also known as split recurring expenses.'
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Found organization recurring expense'
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Record not found'
	})
	@Get('/employee/:orgId')
	async getSplitExpensesForEmployee(
		@Query('data') data: string,
		@Param('orgId') orgId: string
	): Promise<IPagination<IOrganizationRecurringExpenseForEmployeeOutput>> {
		const { findInput } = JSON.parse(data);

		return this.queryBus.execute(
			new OrganizationRecurringExpenseFindSplitExpenseQuery(
				orgId,
				findInput
			)
		);
	}

	@ApiOperation({ summary: 'Update an existing record' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'The record has been successfully edited.'
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Record not found'
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description:
			'Invalid input, The response body may contain clues as to what went wrong'
	})
	@HttpCode(HttpStatus.ACCEPTED)
	@Put(':id')
	async update(
		@Param('id') id: string,
		@Body() entity: IRecurringExpenseEditInput
	): Promise<any> {
		return this.commandBus.execute(
			new OrganizationRecurringExpenseEditCommand(id, entity)
		);
	}

	@ApiOperation({
		summary: 'Find all organization recurring expense by month.'
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Found organization recurring expense',
		type: OrganizationRecurringExpense
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Record not found'
	})
	@Get('/month')
	async findAllExpenses(
		@Query('data') data: string
	): Promise<IPagination<OrganizationRecurringExpense>> {
		const { findInput } = JSON.parse(data);

		return this.queryBus.execute(
			new OrganizationRecurringExpenseByMonthQuery(findInput)
		);
	}

	@ApiOperation({
		summary:
			'Find start date update type & conflicting expenses for the update'
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Found start date update type'
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Record not found'
	})
	@Get('/date-update-type')
	async findStartDateUpdateType(
		@Query('data') data: string
	): Promise<IStartUpdateTypeInfo> {
		const { findInput } = JSON.parse(data);

		return this.queryBus.execute(
			new OrganizationRecurringExpenseStartDateUpdateTypeQuery(findInput)
		);
	}
}
