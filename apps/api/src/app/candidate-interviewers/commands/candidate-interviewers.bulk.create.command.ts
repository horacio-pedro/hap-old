import { ICandidateInterviewersCreateInput } from '@hap/models';
import { ICommand } from '@nestjs/cqrs';

export class CandidateInterviewersBulkCreateCommand implements ICommand {
	static readonly type = '[CandidateInterviewers] Register';

	constructor(public readonly input: ICandidateInterviewersCreateInput) {}
}
