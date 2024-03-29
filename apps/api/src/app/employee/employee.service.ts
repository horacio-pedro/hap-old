import { IEmployeeCreateInput } from '@hap/models';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Brackets, Repository } from 'typeorm';
import { RequestContext } from '../core/context';
import { TenantAwareCrudService } from '../core/crud/tenant-aware-crud.service';
import { Employee } from './employee.entity';

@Injectable()
export class EmployeeService extends TenantAwareCrudService<Employee> {
	constructor(
		@InjectRepository(Employee)
		private readonly employeeRepository: Repository<Employee>
	) {
		super(employeeRepository);
	}

	async createBulk(input: IEmployeeCreateInput[]): Promise<Employee[]> {
		return Promise.all(
			input.map((emp) => {
				emp.user.tenant = {
					id: emp.organization.tenantId
				};
				return this.create(emp);
			})
		);
	}

	public async findAllActive(): Promise<Employee[]> {
		const user = RequestContext.currentUser();

		if (user && user.tenantId) {
			return await this.repository.find({
				where: { isActive: true, tenantId: user.tenantId },
				relations: ['user']
			});
		}
	}

	/**
	 * Find the employees working in the organization for a particular month.
	 * An employee is considered to be 'working' if:
	 * 1. The startedWorkOn date is (not null and) less than the last day forMonth
	 * 2. The endWork date is either null or greater than the first day forMonth
	 * @param organizationId  The organization id of the employees to find
	 * @param forMonth  Only the month & year is considered
	 */
	async findWorkingEmployees(
		organizationId: string,
		tenantId: string,
		forMonth: Date,
		withUser: boolean
	): Promise<{ total: number; items: Employee[] }> {
		let query = this.repository
			.createQueryBuilder('employee')
			.where('"employee"."organizationId" = :organizationId', {
				organizationId
			})
			.andWhere('"employee"."tenantId" = :tenantId', {
				tenantId
			})
			.andWhere('"employee"."startedWorkOn" <= :startedWorkOnCondition', {
				startedWorkOnCondition: moment(forMonth).endOf('month').toDate()
			})
			.andWhere(
				new Brackets((notEndedCondition) => {
					notEndedCondition
						.where('"employee"."endWork" IS NULL')
						.orWhere(
							'"employee"."endWork" >= :endWorkOnCondition',
							{
								endWorkOnCondition: moment(forMonth)
									.startOf('month')
									.toDate()
							}
						);
				})
			);

		if (withUser) {
			query = query.leftJoinAndSelect('employee.user', 'user');
		}

		const [items, total] = await query.getManyAndCount();
		return {
			total,
			items
		};
	}

	async findWithoutTenant(id: string, relations?: any) {
		return await this.repository.findOne(id, relations);
	}
}
