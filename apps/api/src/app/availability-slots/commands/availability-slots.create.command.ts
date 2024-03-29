import { ICommand } from '@nestjs/cqrs';
import { IAvailabilitySlotsCreateInput } from '@hap/models';

export class AvailabilitySlotsCreateCommand implements ICommand {
	static readonly type = '[AvailabilitySlots] Create';

	constructor(public readonly input: IAvailabilitySlotsCreateInput) {}
}
