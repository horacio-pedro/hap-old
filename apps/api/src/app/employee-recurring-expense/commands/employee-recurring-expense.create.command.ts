import { IEmployeeRecurringExpense } from '@hap/models';
import { ICommand } from '@nestjs/cqrs';

export class EmployeeRecurringExpenseCreateCommand implements ICommand {
	static readonly type = '[EmployeeRecurringExpense] Create';

	constructor(public readonly input: IEmployeeRecurringExpense) {}
}
