import { ICommand } from '@nestjs/cqrs';
import { IExpense } from '@hap/models';

export class ExpenseUpdateCommand implements ICommand {
	static readonly type = '[Expense] Update';

	constructor(public readonly id: string, public readonly entity: IExpense) {}
}
