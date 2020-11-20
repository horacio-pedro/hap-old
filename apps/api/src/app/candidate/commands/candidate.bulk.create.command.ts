import { ICommand } from '@nestjs/cqrs';
import { ICandidateCreateInput, LanguagesEnum } from '@hap/models';

export class CandidateBulkCreateCommand implements ICommand {
	static readonly type = '[Candidate] Register';

	constructor(
		public readonly input: ICandidateCreateInput[],
		public readonly languageCode: LanguagesEnum
	) {}
}
