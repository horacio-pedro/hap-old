import { IInviteResendInput } from '@hap/models';
import { ICommand } from '@nestjs/cqrs';

export class InviteResendCommand implements ICommand {
	static readonly type = '[Invite] Resend';

	constructor(public readonly input: IInviteResendInput) {}
}
