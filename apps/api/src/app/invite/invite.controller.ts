import { AuthGuard } from '@nestjs/passport';
import {
	ICreateEmailInvitesInput,
	ICreateEmailInvitesOutput,
	IInviteAcceptInput,
	IInviteResendInput,
	PermissionsEnum,
	LanguagesEnum,
	IOrganizationContactAcceptInviteInput
} from '@hap/models';
import {
	BadRequestException,
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	Query,
	UseGuards,
	Delete,
	Param,
	Put,
	Req
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
	ApiOperation,
	ApiResponse,
	ApiTags,
	ApiExcludeEndpoint
} from '@nestjs/swagger';
import { UpdateResult } from 'typeorm';
import { IPagination } from '../core';
import { InviteAcceptEmployeeCommand } from './commands/invite.accept-employee.command';
import { InviteAcceptUserCommand } from './commands/invite.accept-user.command';
import { InviteOrganizationContactCommand } from './commands/invite.organization-contact.command';
import { Invite } from './invite.entity';
import { InviteService } from './invite.service';
import { InviteResendCommand } from './commands/invite.resend.command';
import { Permissions } from './../shared/decorators/permissions';
import { PermissionGuard } from './../shared/guards/auth/permission.guard';
import { OrganizationContact } from '../organization-contact/organization-contact.entity';
import { Request } from 'express';
import { I18nLang } from 'nestjs-i18n';
import { InviteAcceptOrganizationContactCommand } from './commands/invite.accept-organization-contact.command';
import { TenantPermissionGuard } from '../shared/guards/auth/tenant-permission.guard';

@ApiTags('Invite')
@Controller()
export class InviteController {
	constructor(
		private readonly inviteService: InviteService,
		private readonly commandBus: CommandBus
	) {}

	@ApiOperation({ summary: 'Create email invites' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'The record has been successfully created.'
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description:
			'Invalid input, The response body may contain clues as to what went wrong'
	})
	@HttpCode(HttpStatus.CREATED)
	@UseGuards(AuthGuard('jwt'), TenantPermissionGuard, PermissionGuard)
	@Permissions(PermissionsEnum.ORG_INVITE_EDIT)
	@Post('/emails')
	async createManyWithEmailsId(
		@Body() entity: ICreateEmailInvitesInput,
		@Req() request: Request,
		@I18nLang() languageCode: LanguagesEnum
	): Promise<ICreateEmailInvitesOutput> {
		return this.inviteService.createBulk(
			entity,
			request.get('Origin'),
			languageCode
		);
	}

	@ApiOperation({ summary: 'Get invite.' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Found invite',
		type: Invite
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Record not found'
	})
	@Get('validate')
	async validateInvite(@Query('data') data: string): Promise<Invite> {
		const {
			relations,
			findInput: { email, token }
		} = JSON.parse(data);

		if (!email && !token) {
			throw new BadRequestException('Email & Token Mandatory');
		}

		return this.inviteService.validate(relations, email, token);
	}

	@ApiOperation({ summary: 'Find all invites.' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Found invites',
		type: Invite
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Record not found'
	})
	@UseGuards(AuthGuard('jwt'), TenantPermissionGuard, PermissionGuard)
	@Permissions(
		PermissionsEnum.ORG_INVITE_VIEW,
		PermissionsEnum.ORG_INVITE_EDIT
	)
	@Get('all')
	async findAllInvites(
		@Query('data') data: string
	): Promise<IPagination<Invite>> {
		const { relations, findInput } = JSON.parse(data);

		return this.inviteService.findAll({
			where: findInput,
			relations
		});
	}

	@ApiOperation({ summary: 'Accept employee invite.' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'The record has been successfully created.'
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description:
			'Invalid input, The response body may contain clues as to what went wrong'
	})
	@Post('employee')
	async acceptEmployeeInvite(
		@Body() entity: IInviteAcceptInput,
		@Req() request: Request,
		@I18nLang() languageCode: LanguagesEnum
	): Promise<UpdateResult | Invite> {
		entity.originalUrl = request.get('Origin');
		return this.commandBus.execute(
			new InviteAcceptEmployeeCommand(entity, languageCode)
		);
	}

	@ApiOperation({ summary: 'Accept user invite.' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'The record has been successfully created.'
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description:
			'Invalid input, The response body may contain clues as to what went wrong'
	})
	@Post('user')
	async acceptUserInvite(
		@Body() entity: IInviteAcceptInput,
		@Req() request: Request,
		@I18nLang() languageCode: LanguagesEnum
	): Promise<UpdateResult | Invite> {
		entity.originalUrl = request.get('Origin');
		return this.commandBus.execute(
			new InviteAcceptUserCommand(entity, languageCode)
		);
	}

	@ApiOperation({ summary: 'Accept organization Contact invite.' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'The record has been successfully created.'
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description:
			'Invalid input, The response body may contain clues as to what went wrong'
	})
	@Post('contact')
	async acceptOrganizationContactInvite(
		@Body() input: IOrganizationContactAcceptInviteInput,
		@Req() request: Request,
		@I18nLang() languageCode: LanguagesEnum
	): Promise<any> {
		input.originalUrl = request.get('Origin');
		return this.commandBus.execute(
			new InviteAcceptOrganizationContactCommand(input, languageCode)
		);
	}

	@ApiOperation({ summary: 'Resend invite.' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'The record has been successfully created.'
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description:
			'Invalid input, The response body may contain clues as to what went wrong'
	})
	@UseGuards(AuthGuard('jwt'), TenantPermissionGuard, PermissionGuard)
	@Permissions(PermissionsEnum.ORG_INVITE_EDIT)
	@Post('resend')
	async resendInvite(
		@Body() entity: IInviteResendInput
	): Promise<UpdateResult | Invite> {
		return this.commandBus.execute(new InviteResendCommand(entity));
	}

	@ApiOperation({ summary: 'Delete record' })
	@ApiResponse({
		status: HttpStatus.NO_CONTENT,
		description: 'The record has been successfully deleted'
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Record not found'
	})
	@HttpCode(HttpStatus.ACCEPTED)
	@UseGuards(AuthGuard('jwt'), TenantPermissionGuard, PermissionGuard)
	@Permissions(PermissionsEnum.ORG_INVITE_EDIT)
	@Delete(':id')
	async delete(@Param('id') id: string, ...options: any[]): Promise<any> {
		return this.inviteService.delete(id);
	}

	@ApiExcludeEndpoint()
	@Put()
	async update(@Param('id') id: string, ...options: any[]): Promise<any> {
		throw new BadRequestException('Invalid route');
	}

	@ApiOperation({ summary: 'Update an existing record' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'The record has been successfully edited.'
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Record not found'
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description:
			'Invalid input, The response body may contain clues as to what went wrong'
	})
	@HttpCode(HttpStatus.ACCEPTED)
	@UseGuards(AuthGuard('jwt'), TenantPermissionGuard, PermissionGuard)
	@Permissions(PermissionsEnum.ORG_INVITE_EDIT)
	@Put('organization-contact/:id')
	async inviteOrganizationContact(
		@Param('id') id: string,
		@Req() request,
		@I18nLang() languageCode: LanguagesEnum
	): Promise<OrganizationContact> {
		return this.commandBus.execute(
			new InviteOrganizationContactCommand({
				id,
				originalUrl: request.get('Origin'),
				inviterUser: request.user,
				languageCode
			})
		);
	}
}
