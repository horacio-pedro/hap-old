import { Entity, Column, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ICandidateInterviewers, ICandidateInterview } from '@hap/models';
import { CandidateInterview } from '../candidate-interview/candidate-interview.entity';
import { TenantOrganizationBase } from '../core/entities/tenant-organization-base';

@Entity('candidate_interviewer')
export class CandidateInterviewers
	extends TenantOrganizationBase
	implements ICandidateInterviewers {
	@ApiProperty({ type: String })
	@Column()
	interviewId: string;

	@ApiProperty({ type: String })
	@Column()
	employeeId: string;

	@ManyToOne(
		(type) => CandidateInterview,
		(interview) => interview.interviewers
	)
	interview: ICandidateInterview;
}
