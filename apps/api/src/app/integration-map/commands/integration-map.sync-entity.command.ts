import { ICommand } from '@nestjs/cqrs';
import { IIntegrationMapSyncEntityInput } from '@hap/models';

export class IntegrationMapSyncEntityCommand implements ICommand {
	static readonly type = '[Integration Map] Sync Entity';

	constructor(public readonly input: IIntegrationMapSyncEntityInput) {}
}
