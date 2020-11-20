import { ICommand } from '@nestjs/cqrs';
import { IEventTypeCreateInput } from '@hap/models';

export class EventTypeCreateCommand implements ICommand {
	static readonly type = '[EventType] Create';

	constructor(public readonly input: IEventTypeCreateInput) {}
}
