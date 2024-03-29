import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { EmailTemplateService } from '../../email-template.service';
import { FindEmailTemplateQuery } from '../email-template.find.query';
import {
	ICustomizableEmailTemplate,
	LanguagesEnum,
	EmailTemplateNameEnum,
	IEmailTemplate
} from '@hap/models';
import { IsNull } from 'typeorm';

@QueryHandler(FindEmailTemplateQuery)
export class FindEmailTemplateHandler
	implements IQueryHandler<FindEmailTemplateQuery> {
	constructor(private readonly emailTemplateService: EmailTemplateService) {}

	public async execute(
		command: FindEmailTemplateQuery
	): Promise<ICustomizableEmailTemplate> {
		const {
			input: { languageCode, name, organizationId, tenantId }
		} = command;

		const emailTemplate: ICustomizableEmailTemplate = {
			subject: '',
			template: ''
		};

		[emailTemplate.subject, emailTemplate.template] = await Promise.all([
			this._fetchTemplate(
				languageCode,
				name,
				organizationId,
				tenantId,
				'subject'
			),
			this._fetchTemplate(
				languageCode,
				name,
				organizationId,
				tenantId,
				'html'
			)
		]);

		return emailTemplate;
	}

	private async _fetchTemplate(
		languageCode: LanguagesEnum,
		name: EmailTemplateNameEnum,
		organizationId: string,
		tenantId: string,
		type: 'html' | 'subject'
	): Promise<string> {
		let subject = '';
		let template = '';

		const {
			success: found,
			record
		}: {
			success: boolean;
			record?: IEmailTemplate;
		} = await this.emailTemplateService.findOneOrFail({
			languageCode,
			name: `${name}/${type}`,
			organization: { id: organizationId },
			tenantId
		});

		if (found) {
			subject = record.hbs;
			template = record.mjml;
		} else {
			const { hbs, mjml } = await this.emailTemplateService.findOne({
				languageCode,
				name: `${name}/${type}`,
				organization: IsNull()
			});
			subject = hbs;
			template = mjml;
		}

		switch (type) {
			case 'subject':
				return subject;
			case 'html':
				return template;
		}
	}
}
