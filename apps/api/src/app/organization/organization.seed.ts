import * as _ from 'underscore';
import * as moment from 'moment';
import * as timezone from 'moment-timezone';
import { Connection } from 'typeorm';
import { Organization } from './organization.entity';
import * as faker from 'faker';
import { getDummyImage } from '../core';
import {
	CurrenciesEnum,
	DefaultValueDateTypeEnum,
	BonusTypeEnum,
	WeekDaysEnum,
	AlignmentOptions
} from '@hap/models';
import { Tenant } from './../tenant/tenant.entity';
import { Skill } from '../skills/skill.entity';
import { Contact } from '../contact/contact.entity';

const defaultOrganizationsData = [
	{
		name: 'Ever Technologies LTD',
		currency: CurrenciesEnum.BGN,
		defaultValueDateType: DefaultValueDateTypeEnum.TODAY,
		imageUrl: 'assets/images/logos/ever-large.jpg'
	},
	{
		name: 'Ever Co. Ltd',
		currency: CurrenciesEnum.BGN,
		defaultValueDateType: DefaultValueDateTypeEnum.TODAY,
		imageUrl: 'assets/images/logos/ever-large.jpg'
	}
];

export const getDefaultBulgarianOrganization = async (
	connection: Connection,
	tenant: Tenant
): Promise<Organization> => {
	const repo = connection.getRepository(Organization);
	const existedOrganization = await repo.findOne({
		where: { tenantId: tenant.id, name: 'Ever Technologies LTD' }
	});
	return existedOrganization;
};

let defaultOrganizationsInserted = [];

export const createDefaultOrganizations = async (
	connection: Connection,
	tenant: Tenant
): Promise<Organization[]> => {
	const defaultOrganizations: Organization[] = [];

	const skills = await getSkills(connection);
	const contacts = await getContacts(connection);

	defaultOrganizationsData.forEach((organiziation) => {
		const organizationSkills = _.chain(skills)
			.shuffle()
			.take(faker.random.number({ min: 1, max: 4 }))
			.values()
			.value();

		const defaultOrganization: Organization = new Organization();

		const {
			name,
			currency,
			defaultValueDateType,
			imageUrl
		} = organiziation;

		defaultOrganization.name = name;
		defaultOrganization.profile_link = generateLink(name);
		defaultOrganization.currency = currency;
		defaultOrganization.defaultValueDateType = defaultValueDateType;
		defaultOrganization.imageUrl = imageUrl;
		defaultOrganization.invitesAllowed = true;
		defaultOrganization.bonusType = BonusTypeEnum.REVENUE_BASED_BONUS;
		defaultOrganization.bonusPercentage = 10;
		defaultOrganization.registrationDate = faker.date.past(5);

		defaultOrganization.overview = faker.name.jobDescriptor();
		defaultOrganization.short_description = faker.name.jobDescriptor();
		defaultOrganization.client_focus = faker.name.jobDescriptor();
		defaultOrganization.show_profits = false;
		defaultOrganization.show_bonuses_paid = false;
		defaultOrganization.show_income = false;
		defaultOrganization.show_total_hours = false;
		defaultOrganization.show_projects_count = true;
		defaultOrganization.show_minimum_project_size = true;
		defaultOrganization.show_clients_count = true;
		defaultOrganization.show_clients = true;
		defaultOrganization.show_employees_count = true;
		defaultOrganization.banner = faker.name.jobDescriptor();

		defaultOrganization.skills = organizationSkills;
		defaultOrganization.brandColor = faker.random.arrayElement([
			'red',
			'green',
			'blue',
			'orange',
			'yellow'
		]);
		defaultOrganization.contact = faker.random.arrayElement(contacts);
		defaultOrganization.timeZone = faker.random.arrayElement(
			timezone.tz.names().filter((zone) => zone.includes('/'))
		);
		defaultOrganization.dateFormat = faker.random.arrayElement([
			'L',
			'L hh:mm',
			'LL',
			'LLL',
			'LLLL'
		]);
		defaultOrganization.defaultAlignmentType = faker.random.arrayElement(
			Object.keys(AlignmentOptions)
		);
		defaultOrganization.fiscalStartDate = moment(new Date())
			.add(faker.random.number(10), 'days')
			.toDate();
		defaultOrganization.fiscalEndDate = moment(
			defaultOrganization.fiscalStartDate
		)
			.add(faker.random.number(10), 'days')
			.toDate();
		defaultOrganization.futureDateAllowed = faker.random.boolean();
		defaultOrganization.inviteExpiryPeriod = faker.random.number(50);
		defaultOrganization.numberFormat = faker.random.arrayElement([
			'USD',
			'BGN',
			'ILS'
		]);
		defaultOrganization.officialName = faker.company.companyName();
		defaultOrganization.separateInvoiceItemTaxAndDiscount = faker.random.boolean();
		defaultOrganization.startWeekOn = WeekDaysEnum.MONDAY;
		defaultOrganization.totalEmployees = faker.random.number(4);
		defaultOrganization.tenant = tenant;
		defaultOrganization.valueDate = moment(new Date())
			.add(faker.random.number(10), 'days')
			.toDate();

		defaultOrganizations.push(defaultOrganization);
	});

	await insertOrganizations(connection, defaultOrganizations);

	defaultOrganizationsInserted = [...defaultOrganizations];

	return defaultOrganizations;
};

export const createRandomOrganizations = async (
	connection: Connection,
	tenants: Tenant[],
	noOfOrganizations: number
): Promise<Map<Tenant, Organization[]>> => {
	const currencies = Object.values(CurrenciesEnum);
	const defaultDateTypes = Object.values(DefaultValueDateTypeEnum);
	const skills = await getSkills(connection);
	const contacts = await getContacts(connection);
	const tenantOrganizations: Map<Tenant, Organization[]> = new Map();
	let allOrganizations: Organization[] = [];

	tenants.forEach((tenant) => {
		const randomOrganizations: Organization[] = [];
		if (tenant.name === 'Ever') {
			tenantOrganizations.set(tenant, defaultOrganizationsInserted);
		} else {
			for (let index = 0; index < noOfOrganizations; index++) {
				const organizationSkills = _.chain(skills)
					.shuffle()
					.take(faker.random.number({ min: 1, max: 4 }))
					.values()
					.value();
				const organization = new Organization();
				const companyName = faker.company.companyName();

				const logoAbbreviation = _extractLogoAbbreviation(companyName);

				organization.name = companyName;
				organization.profile_link = generateLink(companyName);
				organization.currency = currencies[index % currencies.length];
				organization.defaultValueDateType =
					defaultDateTypes[index % defaultDateTypes.length];
				organization.imageUrl = getDummyImage(
					330,
					300,
					logoAbbreviation
				);
				organization.invitesAllowed = true;
				organization.overview = faker.name.jobDescriptor();
				organization.short_description = faker.name.jobDescriptor();
				organization.client_focus = faker.name.jobDescriptor();
				organization.show_profits = false;
				organization.show_bonuses_paid = false;
				organization.show_income = false;
				organization.show_total_hours = false;
				organization.show_projects_count = true;
				organization.show_minimum_project_size = true;
				organization.show_clients_count = true;
				organization.show_employees_count = true;
				organization.banner = faker.name.jobDescriptor();

				const { bonusType, bonusPercentage } = randomBonus();
				organization.bonusType = bonusType;
				organization.bonusPercentage = bonusPercentage;
				organization.registrationDate = faker.date.past(
					Math.floor(Math.random() * 10) + 1
				);

				organization.skills = organizationSkills;
				organization.brandColor = faker.random.arrayElement([
					'red',
					'green',
					'blue',
					'orange',
					'yellow'
				]);
				organization.contact = faker.random.arrayElement(contacts);
				organization.timeZone = faker.random.arrayElement(
					timezone.tz.names().filter((zone) => zone.includes('/'))
				);
				organization.dateFormat = faker.random.arrayElement([
					'L',
					'L hh:mm',
					'LL',
					'LLL',
					'LLLL'
				]);
				organization.defaultAlignmentType = faker.random.arrayElement(
					Object.keys(AlignmentOptions)
				);
				organization.fiscalStartDate = moment(new Date())
					.add(faker.random.number(10), 'days')
					.toDate();
				organization.fiscalEndDate = moment(
					organization.fiscalStartDate
				)
					.add(faker.random.number(10), 'days')
					.toDate();
				organization.futureDateAllowed = faker.random.boolean();
				organization.inviteExpiryPeriod = faker.random.number(50);
				organization.numberFormat = faker.random.arrayElement([
					'USD',
					'BGN',
					'ILS'
				]);
				organization.officialName = faker.company.companyName();
				organization.separateInvoiceItemTaxAndDiscount = faker.random.boolean();
				organization.startWeekOn = WeekDaysEnum.MONDAY;
				organization.totalEmployees = faker.random.number(4);
				organization.tenant = tenant;
				organization.valueDate = moment(new Date())
					.add(faker.random.number(10), 'days')
					.toDate();

				randomOrganizations.push(organization);
			}

			tenantOrganizations.set(tenant, randomOrganizations);
		}

		allOrganizations = allOrganizations.concat(randomOrganizations);
	});

	await insertOrganizations(connection, allOrganizations);

	return tenantOrganizations;
};

const insertOrganizations = async (
	connection: Connection,
	organizations: Organization[]
): Promise<void> => {
	await connection
		.createQueryBuilder()
		.insert()
		.into(Organization)
		.values(organizations)
		.execute();
};

const _extractLogoAbbreviation = (companyName: string) => {
	const logoFirstWordFirstLetterIndex = 0;
	const companyNameLastEmptyLetterIndex = companyName.lastIndexOf(' ');
	const logoFirstLetter = companyName[logoFirstWordFirstLetterIndex];

	let logoAbbreviation = logoFirstLetter;

	if (
		companyNameLastEmptyLetterIndex !== -1 &&
		companyNameLastEmptyLetterIndex !== logoFirstWordFirstLetterIndex
	) {
		const logoLastWordFirstLetterIndex =
			companyNameLastEmptyLetterIndex + 1;
		const logoSecondLetter = companyName[logoLastWordFirstLetterIndex];

		logoAbbreviation += logoSecondLetter;
	}

	return logoAbbreviation;
};

const randomBonus = () => {
	const randomNumberBetween = (min, max) =>
		Math.floor(Math.random() * (max - min + 1) + min);

	const bonusType = Object.values(BonusTypeEnum)[randomNumberBetween(0, 1)];

	const bonusPercentage =
		bonusType === BonusTypeEnum.PROFIT_BASED_BONUS
			? randomNumberBetween(65, 75)
			: randomNumberBetween(5, 10);

	return { bonusType, bonusPercentage };
};

const generateLink = (name) => {
	return name.replace(/[^A-Z0-9]+/gi, '-').toLowerCase();
};

const getSkills = async (connection: Connection): Promise<any> => {
	return await connection.manager.find(Skill, {});
};

const getContacts = async (connection: Connection): Promise<Contact[]> => {
	return await connection.manager.find(Contact, {});
};
