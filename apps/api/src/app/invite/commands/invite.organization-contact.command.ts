import { ICommand } from '@nestjs/cqrs';
import { IOrganizationContactInviteInput } from '@hap/models';

export class InviteOrganizationContactCommand implements ICommand {
	static readonly type = '[OrganizationContact] Invite';

	constructor(public readonly input: IOrganizationContactInviteInput) {}
}
