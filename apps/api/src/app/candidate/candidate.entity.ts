import { CandidateSkill } from './../candidate-skill/candidate-skill.entity';
import { CandidateExperience } from './../candidate-experience/candidate-experience.entity';
import {
	ICandidate,
	ICandidateInterview,
	ICandidateSource,
	PayPeriodEnum,
	ICandidateEducation,
	ICandidateExperience,
	ICandidateFeedback,
	ICandidateDocument,
	CandidateStatus,
	ICandidateSkill,
	IOrganizationPosition,
	IOrganizationEmploymentType,
	IOrganizationDepartment,
	IContact,
	ITag
} from '@hap/models';
import { avarage } from '@hap/utils';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsOptional, IsEnum } from 'class-validator';
import {
	Column,
	Entity,
	JoinColumn,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToOne,
	RelationId,
	OneToMany,
	AfterLoad
} from 'typeorm';
import { OrganizationDepartment } from '../organization-department/organization-department.entity';
import { OrganizationEmploymentType } from '../organization-employment-type/organization-employment-type.entity';
import { OrganizationPositions } from '../organization-positions/organization-positions.entity';
import { Tag } from '../tags/tag.entity';
import { User } from '../user/user.entity';
import { CandidateEducation } from '../candidate-education/candidate-education.entity';
import { CandidateSource } from '../candidate-source/candidate-source.entity';
import { CandidateDocument } from '../candidate-documents/candidate-documents.entity';
import { CandidateFeedback } from '../candidate-feedbacks/candidate-feedbacks.entity';
import { CandidateInterview } from '../candidate-interview/candidate-interview.entity';
import { Contact } from '../contact/contact.entity';
import { TenantOrganizationBase } from '../core/entities/tenant-organization-base';

@Entity('candidate')
export class Candidate extends TenantOrganizationBase implements ICandidate {
	@ManyToMany((type) => Tag, (tag) => tag.candidate)
	@JoinTable({
		name: 'tag_candidate'
	})
	tags: ITag[];

	@ApiProperty({ type: Contact })
	@ManyToOne((type) => Contact, { nullable: true, cascade: true })
	@JoinColumn()
	contact: IContact;

	@ApiProperty({ type: String, readOnly: true })
	@RelationId((candidate: Candidate) => candidate.contact)
	readonly contactId?: string;

	@OneToMany(
		(type) => CandidateEducation,
		(candidateEducation) => candidateEducation.candidate
	)
	@JoinColumn()
	educations: ICandidateEducation[];

	@OneToMany(
		(type) => CandidateInterview,
		(candidateInterview) => candidateInterview.candidate
	)
	@JoinColumn()
	interview?: ICandidateInterview[];

	@OneToMany(
		(type) => CandidateExperience,
		(candidateExperience) => candidateExperience.candidate
	)
	@JoinColumn()
	experience: ICandidateExperience[];

	@OneToMany(
		(type) => CandidateSkill,
		(candidateSkill) => candidateSkill.candidate
	)
	@JoinColumn()
	skills: ICandidateSkill[];

	@ApiProperty({ type: CandidateSource })
	@OneToOne((type) => CandidateSource, {
		nullable: true,
		cascade: true,
		onDelete: 'CASCADE'
	})
	@JoinColumn()
	source?: ICandidateSource;

	@OneToMany(
		(type) => CandidateDocument,
		(candidateDocument) => candidateDocument.candidate
	)
	@JoinColumn()
	documents?: ICandidateDocument[];

	@OneToMany(
		(type) => CandidateFeedback,
		(candidateFeedback) => candidateFeedback.candidate
	)
	@JoinColumn()
	feedbacks?: ICandidateFeedback[];

	@ApiProperty({ type: User })
	@OneToOne((type) => User, {
		nullable: false,
		cascade: true,
		onDelete: 'CASCADE'
	})
	@JoinColumn()
	user: User;

	@ApiProperty({ type: String, readOnly: true })
	@RelationId((candidate: Candidate) => candidate.user)
	readonly userId: string;

	@ApiPropertyOptional({ type: Number })
	@IsOptional()
	@Column({ nullable: true, type: 'numeric' })
	rating?: number;

	@ApiProperty({ type: OrganizationPositions })
	@ManyToOne((type) => OrganizationPositions, { nullable: true })
	@JoinColumn()
	organizationPosition?: IOrganizationPosition;

	@ApiProperty({ type: String, readOnly: true })
	@RelationId((candidate: Candidate) => candidate.organizationPosition)
	readonly organizationPositionId?: string;

	@ApiPropertyOptional({ type: Date })
	@IsDate()
	@IsOptional()
	@Column({ nullable: true })
	valueDate?: Date;

	@ApiPropertyOptional({ type: Date })
	@IsDate()
	@IsOptional()
	@Column({ nullable: true })
	appliedDate?: Date;

	@ApiPropertyOptional({ type: Date })
	@IsDate()
	@IsOptional()
	@Column({ nullable: true })
	hiredDate?: Date;

	@ApiProperty({ type: String, enum: CandidateStatus })
	@IsEnum(CandidateStatus)
	@IsOptional()
	@Column({ nullable: true, default: CandidateStatus.APPLIED })
	status?: string;

	@ApiPropertyOptional({ type: Date })
	@IsDate()
	@IsOptional()
	@Column({ nullable: true })
	rejectDate?: Date;

	@ManyToMany(
		(type) => OrganizationDepartment,
		(organizationDepartment) => organizationDepartment.candidates,
		{ cascade: true }
	)
	@JoinTable({
		name: 'candidate_department'
	})
	organizationDepartments?: IOrganizationDepartment[];

	@ManyToMany(
		(type) => OrganizationEmploymentType,
		(organizationEmploymentType) => organizationEmploymentType.candidates,
		{ cascade: true }
	)
	@JoinTable({
		name: 'candidate_employment_type'
	})
	organizationEmploymentTypes?: IOrganizationEmploymentType[];

	@ApiPropertyOptional({ type: String, maxLength: 500 })
	@IsOptional()
	@Column({ length: 500, nullable: true })
	candidateLevel?: string;

	@ApiPropertyOptional({ type: Number })
	@IsDate()
	@IsOptional()
	@Column({ nullable: true })
	reWeeklyLimit?: number; //Recurring Weekly Limit (hours)

	@ApiPropertyOptional({ type: String, maxLength: 255 })
	@IsOptional()
	@Column({ length: 255, nullable: true })
	billRateCurrency?: string;

	@ApiPropertyOptional({ type: Number })
	@IsOptional()
	@Column({ nullable: true })
	billRateValue?: number;

	@ApiProperty({ type: String, enum: PayPeriodEnum })
	@IsEnum(PayPeriodEnum)
	@IsOptional()
	@Column({ nullable: true })
	payPeriod?: string;

	@ApiPropertyOptional({ type: String })
	@IsOptional()
	@Column({ nullable: true })
	cvUrl?: string;

	@ApiPropertyOptional({ type: Boolean, default: false })
	@Column({ nullable: true, default: false })
	isArchived?: boolean;

	ratings?: number;
	@AfterLoad()
	calculateRatings() {
		if (Array.isArray(this.feedbacks)) {
			this.ratings = avarage(this.feedbacks, 'rating');
		}
	}
}
