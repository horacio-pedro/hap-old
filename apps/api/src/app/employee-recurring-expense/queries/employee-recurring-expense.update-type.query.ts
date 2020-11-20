import { IFindStartDateUpdateTypeInput } from '@hap/models';
import { IQuery } from '@nestjs/cqrs';

export class EmployeeRecurringExpenseStartDateUpdateTypeQuery
	implements IQuery {
	static readonly type = '[EmployeeRecurringExpense] Start Date Update Type';

	constructor(public readonly input: IFindStartDateUpdateTypeInput) {}
}
