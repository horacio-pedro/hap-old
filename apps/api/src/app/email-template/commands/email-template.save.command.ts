import { ICommand } from '@nestjs/cqrs';
import { IEmailTemplateSaveInput } from '@hap/models';

export class EmailTemplateSaveCommand implements ICommand {
	static readonly type = '[EmailTemplate] Save';

	constructor(public readonly input: IEmailTemplateSaveInput) {}
}
