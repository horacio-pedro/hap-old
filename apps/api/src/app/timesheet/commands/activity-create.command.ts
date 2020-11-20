import { ICommand } from '@nestjs/cqrs';
import { IActivity } from '@hap/models';

export class ActivityCreateCommand implements ICommand {
	static readonly type = '[Activity] Create Activity';

	constructor(public readonly input: IActivity) {}
}
