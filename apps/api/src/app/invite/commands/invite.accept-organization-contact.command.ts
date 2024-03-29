import {
	LanguagesEnum,
	IOrganizationContactAcceptInviteInput
} from '@hap/models';
import { ICommand } from '@nestjs/cqrs';

export class InviteAcceptOrganizationContactCommand implements ICommand {
	static readonly type = '[Invite] Accept Organziation Contact';

	constructor(
		public readonly input: IOrganizationContactAcceptInviteInput,
		public readonly languageCode: LanguagesEnum
	) {}
}
