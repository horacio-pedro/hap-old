import { ICommand } from '@nestjs/cqrs';
import { ISubmitTimesheetInput } from '@hap/models';

export class TimesheetSubmitCommand implements ICommand {
	static readonly type = '[Timesheet] update-status';

	constructor(public readonly input: ISubmitTimesheetInput) {}
}
