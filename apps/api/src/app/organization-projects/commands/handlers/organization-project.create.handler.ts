import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrganizationProjectCreateCommand } from '../organization-project.create.command';
import { OrganizationProjectsService } from '../../organization-projects.service';
import { IOrganizationProject } from '@hap/models';

@CommandHandler(OrganizationProjectCreateCommand)
export class OrganizationProjectCreateHandler
	implements ICommandHandler<OrganizationProjectCreateCommand> {
	constructor(private readonly ops: OrganizationProjectsService) {}

	public async execute(
		command: OrganizationProjectCreateCommand
	): Promise<IOrganizationProject> {
		return this.ops.create(command.input);
	}
}
