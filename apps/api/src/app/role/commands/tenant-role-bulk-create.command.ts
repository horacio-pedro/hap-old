import { ICommand } from '@nestjs/cqrs';
import { ITenant } from '@hap/models';

export class TenantRoleBulkCreateCommand implements ICommand {
	static readonly type = '[Role] Bulk Create';

	constructor(public readonly input: ITenant[]) {}
}
