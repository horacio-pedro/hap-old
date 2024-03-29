import { Column, Entity, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { ICandidateSkill, ICandidate } from '@hap/models';
import { Candidate } from '../candidate/candidate.entity';
import { TenantOrganizationBase } from '../core/entities/tenant-organization-base';

@Entity('candidate_skill')
export class CandidateSkill
	extends TenantOrganizationBase
	implements ICandidateSkill {
	@ApiProperty({ type: String })
	@Column()
	name: string;

	@ApiProperty({ type: String })
	@IsString()
	@IsNotEmpty()
	@Column({ nullable: true })
	candidateId?: string;

	@ManyToOne((type) => Candidate, (candidate) => candidate.skills)
	candidate: ICandidate;
}
