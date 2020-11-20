import { ICommand } from '@nestjs/cqrs';
import { IEditEntityByMemberInput as IOrganizationDepartmentEditByEmployeeInput } from '@hap/models';

export class OrganizationDepartmentEditByEmployeeCommand implements ICommand {
	static readonly type = '[OrganizationDepartment] Edit By Employee';

	constructor(
		public readonly input: IOrganizationDepartmentEditByEmployeeInput
	) {}
}
