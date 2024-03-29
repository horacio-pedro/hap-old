import {
	Column,
	Entity,
	Index,
	JoinColumn,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToMany,
	RelationId
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsBoolean,
	IsDate,
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	Max,
	Min
} from 'class-validator';
import {
	BonusTypeEnum,
	CurrenciesEnum,
	DefaultValueDateTypeEnum,
	IOrganization,
	WeekDaysEnum,
	MinimumProjectSizeEnum,
	CurrencyPosition,
	IContact,
	ITag,
	IInvoice,
	IEmployee,
	IDeal,
	ISkill,
	IPayment,
	IOrganizationSprint,
	IInvoiceEstimateHistory
} from '@hap/models';
import { Tag } from '../tags/tag.entity';
import { Skill } from '../skills/skill.entity';
import { Invoice } from '../invoice/invoice.entity';
import { Payment } from '../payment/payment.entity';
import { Contact } from '../contact/contact.entity';
import { TenantBase } from '../core/entities/tenant-base';
import { OrganizationSprint } from '../organization-sprint/organization-sprint.entity';
import { Employee } from '../employee/employee.entity';
import { InvoiceEstimateHistory } from '../invoice-estimate-history/invoice-estimate-history.entity';
import { Deal } from '../deal/deal.entity';

@Entity('organization')
export class Organization extends TenantBase implements IOrganization {
	@ApiProperty()
	@ManyToMany((type) => Tag)
	@JoinTable({
		name: 'tag_organization'
	})
	tags: ITag[];

	@ApiProperty({ type: Contact })
	@ManyToOne((type) => Contact, { nullable: true, cascade: true })
	@JoinColumn()
	contact: IContact;

	@ApiProperty({ type: String, readOnly: true })
	@RelationId((organization: Organization) => organization.contact)
	readonly contactId?: string;

	@ApiPropertyOptional({ type: Invoice, isArray: true })
	@OneToMany((type) => Invoice, (invoices) => invoices.fromOrganization)
	@JoinColumn()
	invoices?: IInvoice[];

	@ApiProperty({ type: Employee })
	@OneToMany(() => Employee, (employee) => employee.organization)
	@JoinColumn()
	employees?: IEmployee[];

	@ApiProperty({ type: Deal })
	@OneToMany(() => Deal, (deal) => deal.organization)
	@JoinColumn()
	deals?: IDeal[];

	@ApiProperty({ type: String })
	@IsString()
	@IsNotEmpty()
	@Index()
	@Column()
	name: string;

	@ApiProperty({ type: String, minLength: 3, maxLength: 100 })
	@IsString()
	@Index({ unique: true })
	@IsOptional()
	@Column({ nullable: true })
	profile_link: string;

	@ApiProperty({ type: String, maxLength: 300 })
	@IsString()
	@Index()
	@IsOptional()
	@Column({ nullable: true })
	banner: string;

	@ApiProperty({ type: Number, maxLength: 4 })
	@IsString()
	@Index()
	@Column({ nullable: true })
	totalEmployees: number;

	@ApiProperty({ type: String, maxLength: 600 })
	@IsString()
	@Index()
	@IsOptional()
	@Column({ nullable: true })
	short_description: string;

	@ApiProperty({ type: String })
	@IsString()
	@Index()
	@IsOptional()
	@Column({ nullable: true })
	client_focus: string;

	@ApiProperty({ type: String })
	@IsString()
	@Index()
	@IsOptional()
	@Column({ nullable: true })
	overview: string;

	@ApiPropertyOptional({ type: String, maxLength: 500 })
	@IsOptional()
	@Column({ length: 500, nullable: true })
	imageUrl?: string;

	@ApiProperty({ type: String, enum: CurrenciesEnum })
	@IsEnum(CurrenciesEnum)
	@IsNotEmpty()
	@Index()
	@Column()
	currency: string;

	@ApiPropertyOptional({ type: Date })
	@IsDate()
	@IsOptional()
	@Column({ nullable: true })
	valueDate?: Date;

	@ApiProperty({ type: String, enum: DefaultValueDateTypeEnum })
	@IsEnum(DefaultValueDateTypeEnum)
	@IsNotEmpty()
	@Index()
	@Column()
	defaultValueDateType: string;

	@ApiProperty({ type: Boolean, default: true })
	@Column({ default: true })
	isActive: boolean;

	@ApiProperty({ type: String })
	@Column()
	@IsOptional()
	@Column({ nullable: true })
	defaultAlignmentType?: string;

	@ApiProperty({ type: String })
	@Column()
	@IsOptional()
	@Column({ nullable: true })
	timeZone?: string;

	@ApiProperty({ type: String })
	@Column()
	@IsOptional()
	@Column({ nullable: true })
	brandColor?: string;

	@ApiProperty({ type: String })
	@Column()
	@IsOptional()
	@Column({ nullable: true })
	dateFormat?: string;

	@ApiProperty({ type: String })
	@Column()
	@IsOptional()
	@Column({ nullable: true })
	officialName?: string;

	@ApiProperty({ type: String, enum: WeekDaysEnum })
	@Column()
	@IsOptional()
	@Column({ nullable: true })
	startWeekOn?: string;

	@ApiProperty({ type: String, maxLength: 256 })
	@Column()
	@IsOptional()
	@Column({ nullable: true })
	taxId?: string;

	@ApiProperty({ type: String })
	@Column()
	@IsOptional()
	@Column({ nullable: true })
	numberFormat?: string;

	@ApiProperty({ type: String, enum: MinimumProjectSizeEnum })
	@IsEnum(BonusTypeEnum)
	@Column({ nullable: true })
	minimumProjectSize?: string;

	@ApiProperty({ type: String, enum: BonusTypeEnum })
	@IsEnum(BonusTypeEnum)
	@Column({ nullable: true })
	bonusType?: string;

	@ApiProperty({ type: Number })
	@IsNumber()
	@Min(0)
	@Max(100)
	@Column({ nullable: true })
	bonusPercentage?: number;

	@ApiProperty({ type: Boolean })
	@IsBoolean()
	@Column({ nullable: true })
	invitesAllowed?: boolean;

	@ApiProperty({ type: Boolean })
	@IsBoolean()
	@Column({ nullable: true })
	show_income?: boolean;

	@ApiProperty({ type: Boolean })
	@IsBoolean()
	@Column({ nullable: true })
	show_profits?: boolean;

	@ApiProperty({ type: Boolean })
	@IsBoolean()
	@Column({ nullable: true })
	show_bonuses_paid?: boolean;

	@ApiProperty({ type: Boolean })
	@IsBoolean()
	@Column({ nullable: true })
	show_total_hours?: boolean;

	@ApiProperty({ type: Boolean })
	@IsBoolean()
	@Column({ nullable: true })
	show_minimum_project_size?: boolean;

	@ApiProperty({ type: Boolean })
	@IsBoolean()
	@Column({ nullable: true })
	show_projects_count?: boolean;

	@ApiProperty({ type: Boolean })
	@IsBoolean()
	@Column({ nullable: true })
	show_clients_count?: boolean;

	@ApiProperty({ type: Boolean })
	@IsBoolean()
	@Column({ nullable: true })
	show_clients?: boolean;

	@ApiProperty({ type: Boolean })
	@IsBoolean()
	@Column({ nullable: true })
	show_employees_count?: boolean;

	@ApiProperty({ type: Number })
	@IsNumber()
	@Column({ nullable: true })
	inviteExpiryPeriod?: number;

	@ApiProperty({ type: Date })
	@Column({ nullable: true })
	@IsOptional()
	@IsDate()
	fiscalStartDate?: Date;

	@ApiProperty({ type: Date })
	@Column({ nullable: true })
	@IsOptional()
	@IsDate()
	fiscalEndDate?: Date;

	@ApiProperty({ type: Date })
	@Column({ nullable: true })
	@IsOptional()
	@IsDate()
	registrationDate?: Date;

	@ApiProperty({ type: Boolean })
	@IsBoolean()
	@Column({ nullable: true })
	futureDateAllowed?: boolean;

	@ApiProperty({ type: Boolean })
	@IsBoolean()
	@Column({ default: true })
	allowManualTime?: boolean;

	@ApiProperty({ type: Boolean })
	@IsBoolean()
	@Column({ default: true })
	allowModifyTime?: boolean;

	@ApiProperty({ type: Boolean })
	@IsBoolean()
	@Column({ default: true })
	allowDeleteTime?: boolean;

	@ApiProperty({ type: Boolean })
	@IsBoolean()
	@Column({ default: false })
	requireReason?: boolean;

	@ApiProperty({ type: Boolean })
	@IsBoolean()
	@Column({ default: false })
	requireDescription?: boolean;

	@ApiProperty({ type: Boolean })
	@IsBoolean()
	@Column({ default: false })
	requireProject?: boolean;

	@ApiProperty({ type: Boolean })
	@IsBoolean()
	@Column({ default: false })
	requireTask?: boolean;

	@ApiProperty({ type: Boolean })
	@IsBoolean()
	@Column({ default: false })
	requireClient?: boolean;

	@ApiProperty({ enum: [12, 24] })
	@IsBoolean()
	@Column({ default: 12 })
	timeFormat?: 12 | 24;

	@ApiProperty({ type: Skill })
	@ManyToMany((type) => Skill, (skill) => skill.organization)
	@JoinTable({
		name: 'skill_organization'
	})
	skills: ISkill[];

	@ApiPropertyOptional({ type: Payment, isArray: true })
	@OneToMany((type) => Payment, (payment) => payment.organization, {
		onDelete: 'SET NULL'
	})
	@JoinColumn()
	payments?: IPayment[];

	@ApiPropertyOptional({ type: Boolean })
	@IsBoolean()
	@Column({ nullable: true })
	separateInvoiceItemTaxAndDiscount?: boolean;

	@ApiPropertyOptional({ type: OrganizationSprint, isArray: true })
	@OneToMany((type) => OrganizationSprint, (sprints) => sprints.organization)
	@JoinColumn()
	organizationSprints?: IOrganizationSprint[];

	@ApiPropertyOptional({ type: InvoiceEstimateHistory, isArray: true })
	@OneToMany(
		(type) => InvoiceEstimateHistory,
		(invoiceEstimateHistory) => invoiceEstimateHistory.organization,
		{
			onDelete: 'SET NULL'
		}
	)
	@JoinColumn()
	invoiceEstimateHistories?: IInvoiceEstimateHistory[];

	@ApiProperty({ type: String })
	@Column()
	@IsOptional()
	@Column({ nullable: true })
	website?: string;

	@ApiProperty({ type: String })
	@Column()
	@IsOptional()
	@Column({ nullable: true })
	fiscalInformation?: string;

	@ApiPropertyOptional({ type: String, enum: CurrencyPosition })
	@IsEnum(CurrencyPosition)
	@IsOptional()
	@Column({ default: 'LEFT' })
	currencyPosition?: string;

	@ApiPropertyOptional({ type: Boolean })
	@IsBoolean()
	@Column({ nullable: true })
	discountAfterTax?: boolean;
}
