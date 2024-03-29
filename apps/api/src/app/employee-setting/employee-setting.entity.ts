import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import {
	IsNotEmpty,
	IsString,
	IsNumber,
	Min,
	Max,
	IsEnum
} from 'class-validator';
import { IEmployeeSetting, CurrenciesEnum } from '@hap/models';
import { Employee } from '../employee/employee.entity';
import { TenantOrganizationBase } from '../core/entities/tenant-organization-base';

@Entity('employee_setting')
export class EmployeeSetting
	extends TenantOrganizationBase
	implements IEmployeeSetting {
	@ApiProperty({ type: String })
	@IsString()
	@IsNotEmpty()
	@Index()
	@Column()
	employeeId: string;

	@ApiProperty({ type: Number, minimum: 1, maximum: 12 })
	@IsNumber()
	@IsNotEmpty()
	@Min(1)
	@Max(12)
	@Column()
	month: number;

	@ApiProperty({ type: Number, minimum: 1 })
	@IsNumber()
	@IsNotEmpty()
	@Min(0)
	@Column()
	year: number;

	@ApiProperty({ type: String })
	@IsString()
	@IsNotEmpty()
	@Index()
	@Column()
	settingType: string;

	@ApiProperty({ type: Number })
	@IsNumber()
	@IsNotEmpty()
	@Column()
	value: number;

	@ApiProperty({ type: String, enum: CurrenciesEnum })
	@IsEnum(CurrenciesEnum)
	@IsNotEmpty()
	@Index()
	@Column()
	currency: string;

	@ManyToOne((type) => Employee, (employee) => employee.id)
	employee: Employee;
}
