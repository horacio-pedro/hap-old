import { Connection } from 'typeorm';
import {
	ITimeOffPolicy as ITimeOfPolicy,
	IOrganization,
	IEmployee
} from '@hap/models';
import { TimeOffPolicy } from './time-off-policy.entity';
import { Tenant } from '../tenant/tenant.entity';
import * as faker from 'faker';

export const createDefaultTimeOffPolicy = async (
	connection: Connection,
	defaultData: {
		org: IOrganization;
		employees: IEmployee[];
	}
): Promise<ITimeOfPolicy> => {
	const defaultTimeOffPolicy = new TimeOffPolicy();

	defaultTimeOffPolicy.name = 'Default Policy';
	defaultTimeOffPolicy.organization = defaultData.org;
	defaultTimeOffPolicy.tenant = defaultData.org.tenant;
	defaultTimeOffPolicy.requiresApproval = false;
	defaultTimeOffPolicy.paid = true;
	defaultTimeOffPolicy.employees = defaultData.employees;

	await insertDefaultPolicy(connection, defaultTimeOffPolicy);
	return defaultTimeOffPolicy;
};

const insertDefaultPolicy = async (
	connection: Connection,
	defaultPolicy: TimeOffPolicy
): Promise<void> => {
	await connection
		.createQueryBuilder()
		.insert()
		.into(TimeOffPolicy)
		.values(defaultPolicy)
		.execute();
};

export const createRandomTimeOffPolicies = async (
	connection: Connection,
	tenants: Tenant[],
	tenantOrganizationsMap: Map<Tenant, IOrganization[]>
): Promise<TimeOffPolicy[]> => {
	const policies: TimeOffPolicy[] = [];
	const policyArray = [
		'Policy 1',
		'Policy 2',
		'Policy 3',
		'Policy 4',
		'Policy 5',
		'Policy 6',
		'Policy 7',
		'Policy 8',
		'Policy 9',
		'Policy 10'
	];

	(tenants || []).forEach((tenant) => {
		const organizations = tenantOrganizationsMap.get(tenant);
		(organizations || []).forEach((organization) => {
			policyArray.forEach((name) => {
				const policy = new TimeOffPolicy();
				policy.name = name;
				policy.organization = organization;
				policy.tenant = tenant;
				policy.paid = faker.random.arrayElement([true, false]);
				policy.requiresApproval = faker.random.arrayElement([
					true,
					false
				]);
				policies.push(policy);
			});
		});
	});

	return await connection.manager.save(policies);
};
