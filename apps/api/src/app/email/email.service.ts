import { environment } from '@env-api/environment';
import {
	IOrganizationContact,
	IOrganizationDepartment,
	IOrganizationProject,
	LanguagesEnum
} from '@hap/models';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as Email from 'email-templates';
import * as Handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';
import { Repository, IsNull } from 'typeorm';
import { CrudService } from '../core';
import { EmailTemplate } from '../email-template/email-template.entity';
import { Organization } from '../organization/organization.entity';
import { User } from '../user/user.entity';
import { Email as IEmail } from './email.entity';
import { Invite } from '../invite/invite.entity';
import { Timesheet } from '../timesheet/timesheet.entity';
import { RequestContext } from '../core/context';

export interface InviteUserModel {
	email: string;
	role: string;
	organization: Organization;
	registerUrl: string;
	languageCode: LanguagesEnum;
	invitedBy: User;
	originUrl?: string;
}

export interface InviteEmployeeModel {
	email: string;
	registerUrl: string;
	organization: Organization;
	languageCode: LanguagesEnum;
	invitedBy: User;
	projects?: IOrganizationProject[];
	organizationContacts?: IOrganizationContact[];
	departments?: IOrganizationDepartment[];
	originUrl?: string;
}

@Injectable()
export class EmailService extends CrudService<IEmail> {
	constructor(
		@InjectRepository(IEmail)
		private readonly emailRepository: Repository<IEmail>,
		@InjectRepository(EmailTemplate)
		private readonly emailTemplateRepository: Repository<EmailTemplate>,
		@InjectRepository(Organization)
		private readonly organizationRepository: Repository<Organization>
	) {
		super(emailRepository);
	}

	email = new Email({
		message: {
			from: 'hap@Ever.co'
		},
		transport: {
			jsonTransport: true
		},
		i18n: {},
		views: {
			options: {
				extension: 'hbs'
			}
		},
		preview: {
			open: {
				app: 'firefox',
				wait: false
			}
		},
		render: (view, locals) => {
			return new Promise(async (resolve, reject) => {
				view = view.replace('\\', '/');
				let emailTemplate: EmailTemplate[];
				// Find email template for customized for given organization
				const customEmailTemplate = await this.emailTemplateRepository.find(
					{
						name: view,
						languageCode: locals.locale || 'en',
						organization: { id: locals.organizationId }
					}
				);
				emailTemplate = customEmailTemplate;
				// if no email template present for given organization, use default email template
				if (!customEmailTemplate || customEmailTemplate.length < 1) {
					const defaultEmailTemplate = await this.emailTemplateRepository.find(
						{
							name: view,
							languageCode: locals.locale || 'en',
							organization: { id: IsNull() }
						}
					);
					emailTemplate = defaultEmailTemplate;
				}

				if (!emailTemplate || emailTemplate.length < 1) {
					return resolve('');
				}

				const template = Handlebars.compile(emailTemplate[0].hbs);
				const html = template(locals);

				return resolve(html);
			});
		}
	});

	emailInvoice(
		languageCode: LanguagesEnum,
		email: string,
		base64: string,
		invoiceNumber: number,
		invoiceId: string,
		isEstimate: boolean,
		token: any,
		originUrl?: string
	) {
		this.email
			.send({
				template: isEstimate ? 'email-estimate' : 'email-invoice',
				message: {
					to: `${email}`,
					attachments: [
						{
							filename: `${
								isEstimate ? 'Estimate' : 'Invoice'
							}-${invoiceNumber}.pdf`,
							content: base64,
							encoding: 'base64'
						}
					]
				},
				locals: {
					locale: languageCode,
					host: originUrl || environment.host,
					acceptUrl:
						originUrl +
						`#/auth/estimate/?token=${token}&id=${invoiceId}&action=accept&email=${email}`,
					rejectUrl:
						originUrl +
						`#/auth/estimate/?token=${token}&id=${invoiceId}&action=reject&email=${email}`
				}
			})
			.then((res) => {
				this.createEmailRecord({
					templateName: isEstimate
						? 'email-estimate'
						: 'email-invoice',
					email,
					languageCode,
					message: res.originalMessage
				});
			})
			.catch(console.error);
	}

	inviteOrganizationContact(
		organizationContact: IOrganizationContact,
		inviterUser: User,
		organization: Organization,
		invite: Invite,
		languageCode: LanguagesEnum,
		originUrl?: string
	) {
		const sendOptions = {
			template: 'invite-organization-client',
			message: {
				to: `${organizationContact.primaryEmail}`
			},
			locals: {
				locale: languageCode,
				name: organizationContact.name,
				host: originUrl || environment.host,
				id: organizationContact.id,
				inviterName: inviterUser
					? (inviterUser.firstName || '') +
					  (inviterUser.lastName || '')
					: '',
				organizationName: organization.name,
				organizationId: organization.id,
				generatedUrl:
					originUrl +
					`#/auth/accept-client-invite?email=${organizationContact.primaryEmail}&token=${invite.token}`
			}
		};

		this.email
			.send(sendOptions)
			.then((res) => {
				this.createEmailRecord({
					templateName: sendOptions.template,
					email: organizationContact.primaryEmail,
					languageCode,
					message: res.originalMessage,
					organization
				});
			})
			.catch(console.error);
	}

	inviteUser(inviteUserModel: InviteUserModel) {
		const {
			email,
			role,
			organization,
			registerUrl,
			originUrl,
			languageCode,
			invitedBy
		} = inviteUserModel;

		const sendOptions = {
			template: 'invite-user',
			message: {
				to: `${email}`
			},
			locals: {
				locale: languageCode,
				role: role,
				organizationName: organization.name,
				organizationId: organization.id,
				generatedUrl: registerUrl,
				host: originUrl || environment.host
			}
		};

		this.email
			.send(sendOptions)
			.then((res) => {
				this.createEmailRecord({
					templateName: sendOptions.template,
					email,
					languageCode,
					message: res.originalMessage,
					organization,
					user: invitedBy
				});
			})
			.catch(console.error);
	}

	inviteEmployee(inviteEmployeeModel: InviteEmployeeModel) {
		const {
			email,
			registerUrl,
			projects,
			organization,
			originUrl,
			languageCode,
			invitedBy
		} = inviteEmployeeModel;

		const sendOptions = {
			template: 'invite-employee',
			message: {
				to: `${email}`
			},
			locals: {
				locale: languageCode,
				role: projects,
				organizationName: organization.name,
				organizationId: organization.id,
				generatedUrl: registerUrl,
				host: originUrl || environment.host
			}
		};

		this.email
			.send(sendOptions)
			.then((res) => {
				this.createEmailRecord({
					templateName: sendOptions.template,
					email,
					languageCode,
					message: res.originalMessage,
					organization,
					user: invitedBy
				});
			})
			.catch(console.error);
	}

	async welcomeUser(
		user: User,
		languageCode: LanguagesEnum,
		organizationId?: string,
		originUrl?: string
	) {
		const sendOptions = {
			template: 'welcome-user',
			message: {
				to: `${user.email}`
			},
			locals: {
				locale: languageCode,
				email: user.email,
				host: originUrl || environment.host,
				organizationId: organizationId ? organizationId : IsNull()
			}
		};

		let organization: Organization;

		if (organizationId) {
			organization = await this.organizationRepository.findOne(
				organizationId
			);
		}

		this.email
			.send(sendOptions)
			.then((res) => {
				this.createEmailRecord({
					templateName: sendOptions.template,
					email: user.email,
					languageCode,
					message: res.originalMessage,
					organization
				});
			})
			.catch(console.error);
	}

	async requestPassword(
		user: User,
		url: string,
		languageCode: LanguagesEnum,
		organizationId: string,
		originUrl?: string
	) {
		const sendOptions = {
			template: 'password',
			message: {
				to: `${user.email}`,
				subject: 'Forgotten Password'
			},
			locals: {
				locale: languageCode,
				generatedUrl: url,
				host: originUrl || environment.host,
				organizationId: organizationId
			}
		};

		const organization = await this.organizationRepository.findOne(
			organizationId
		);

		this.email
			.send(sendOptions)
			.then((res) => {
				this.createEmailRecord({
					templateName: sendOptions.template,
					email: user.email,
					languageCode,
					message: res.originalMessage,
					organization
				});
			})
			.catch(console.error);
	}

	async createEmailRecord(createEmailOptions: {
		templateName: string;
		email: string;
		languageCode: LanguagesEnum;
		message: any;
		organization?: Organization;
		user?: User;
	}): Promise<IEmail> {
		const emailEntity = new IEmail();

		const {
			templateName: template,
			email,
			languageCode,
			message,
			organization,
			user
		} = createEmailOptions;

		const emailTemplate = await this.emailTemplateRepository.findOne({
			name: template + '/html',
			languageCode
		});

		emailEntity.name = message.subject;
		emailEntity.email = email;
		emailEntity.content = message.html;
		emailEntity.emailTemplate = emailTemplate;

		if (organization) {
			emailEntity.organizationId = organization.id;
		}

		if (user) {
			emailEntity.user = user;
		}

		return this.emailRepository.save(emailEntity);
	}

	async sendAppointmentMail(
		email: string,
		languageCode: LanguagesEnum,
		organizationId?: string,
		originUrl?: string
	) {
		const sendOptions = {
			template: 'email-appointment',
			message: {
				to: email
			},
			locals: {
				locale: languageCode,
				email: email,
				host: originUrl || environment.host,
				organizationId: organizationId ? organizationId : IsNull()
			}
		};

		let organization: Organization;

		if (organizationId) {
			organization = await this.organizationRepository.findOne(
				organizationId
			);
		}

		this.email
			.send(sendOptions)
			.then((res) => {
				this.createEmailRecord({
					templateName: sendOptions.template,
					email: email,
					languageCode,
					message: res.originalMessage,
					organization
				});
			})
			.catch(console.error);
	}

	async setTimesheetAction(email: string, timesheet: Timesheet) {
		const languageCode = RequestContext.getLanguageCode();

		const sendOptions = {
			template: 'timesheet-action',
			message: {
				to: email
			},
			locals: {
				locale: languageCode,
				email: email,
				host: environment.host,
				timesheet: timesheet,
				timesheet_action: timesheet.status
			}
		};

		const organization = await this.organizationRepository.findOne(
			timesheet.employee.organizationId
		);

		this.email
			.send(sendOptions)
			.then((res) => {
				this.createEmailRecord({
					templateName: sendOptions.template,
					email: email,
					languageCode,
					message: res.originalMessage,
					organization,
					user: timesheet.employee.user
				});
			})
			.catch(console.error);
	}

	async timesheetSubmit(email: string, timesheet: Timesheet) {
		const languageCode = RequestContext.getLanguageCode();

		const sendOptions = {
			template: 'timesheet-submit',
			message: {
				to: email
			},
			locals: {
				locale: languageCode,
				email: email,
				host: environment.host,
				timesheet: timesheet,
				timesheet_action: timesheet.status
			}
		};

		const organization = await this.organizationRepository.findOne(
			timesheet.employee.organizationId
		);

		this.email
			.send(sendOptions)
			.then((res) => {
				this.createEmailRecord({
					templateName: sendOptions.template,
					email: email,
					languageCode,
					message: res.originalMessage,
					organization,
					user: timesheet.employee.user
				});
			})
			.catch(console.error);
	}

	// tested e-mail send functionality
	async nodemailerSendEmail(user: User, url: string) {
		const testAccount = await nodemailer.createTestAccount();

		const transporter = nodemailer.createTransport({
			host: 'smtp.ethereal.email',
			port: 587,
			secure: false, // true for 465, false for other ports
			auth: {
				user: testAccount.user,
				pass: testAccount.pass
			}
		});

		// Gmail example:

		// const transporter = nodemailer.createTransport({
		// 	service: 'gmail',
		// 	auth: {
		// 		user: 'user@gmail.com',
		// 		pass: 'password'
		// 	}
		// });

		const info = await transporter.sendMail({
			from: 'HAP',
			to: user.email,
			subject: 'Forgotten Password',
			text: 'Forgot Password',
			html:
				'Hello! <br><br> We received a password change request.<br><br>If you requested to reset your password<br><br>' +
				'<a href=' +
				url +
				'>Click here</a>'
		});

		console.log('Message sent: %s', info.messageId);
		console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
	}
}
