import { ICommand } from '@nestjs/cqrs';
import { IUpdateTimesheetStatusInput } from '@hap/models';

export class TimesheetUpdateStatusCommand implements ICommand {
	static readonly type = '[Timesheet] update-status';

	constructor(public readonly input: IUpdateTimesheetStatusInput) {}
}
