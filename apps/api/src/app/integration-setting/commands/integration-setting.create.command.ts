import { ICommand } from '@nestjs/cqrs';
import { IIntegrationSetting } from '@hap/models';

export class IntegrationSettingCreateCommand implements ICommand {
	static readonly type = '[Integration Setting] Create Integration Setting';

	constructor(public readonly input: IIntegrationSetting) {}
}
