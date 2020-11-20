import { ICommand } from '@nestjs/cqrs';
import { IEditEntityByMemberInput as IOrganizationProjectEditByEmployeeInput } from '@hap/models';

export class OrganizationProjectEditByEmployeeCommand implements ICommand {
	static readonly type = '[OrganizationProject] Edit By Employee';

	constructor(
		public readonly input: IOrganizationProjectEditByEmployeeInput
	) {}
}
