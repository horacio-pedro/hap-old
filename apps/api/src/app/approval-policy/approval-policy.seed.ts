import { Connection } from 'typeorm';
import { IOrganization } from '@hap/models';
import { ApprovalPolicy } from './approval-policy.entity';
import { Tenant } from '../tenant/tenant.entity';

export const createDefaultApprovalPolicyForOrg = async (
	connection: Connection,
	defaultData: {
		orgs: IOrganization[];
	}
): Promise<void> => {
	const promises = [];

	defaultData.orgs.forEach((org) => {
		const defaultApprovalPolicy = new ApprovalPolicy();
		defaultApprovalPolicy.name = 'Default Approval Policy';
		defaultApprovalPolicy.organization = org;
		defaultApprovalPolicy.tenant = org.tenant;
		defaultApprovalPolicy.description = 'Default approval policy';
		defaultApprovalPolicy.approvalType = 'DEFAULT_APPROVAL_POLICY';
		promises.push(insertDefaultPolicy(connection, defaultApprovalPolicy));
	});

	await Promise.all(promises);
};

const insertDefaultPolicy = async (
	connection: Connection,
	defaultPolicy: ApprovalPolicy
): Promise<void> => {
	await connection
		.createQueryBuilder()
		.insert()
		.into(ApprovalPolicy)
		.values(defaultPolicy)
		.execute();
};

export const createRandomApprovalPolicyForOrg = async (
	connection: Connection,
	tenants: Tenant[],
	tenantOrganizationsMap: Map<Tenant, IOrganization[]>
): Promise<ApprovalPolicy[]> => {
	const policies: ApprovalPolicy[] = [];
	const policyArray = [
		'Trade Policy',
		'Union Budget',
		'Definition, Licensing Policies and Registration',
		'State Government Industrial Policies',
		'Reservation Policy',
		'National Policies',
		'International Policies',
		'Time Off',
		'Equipment Sharing'
	];

	for (const tenant of tenants) {
		const orgs = tenantOrganizationsMap.get(tenant);
		orgs.forEach((org) => {
			policyArray.forEach((name) => {
				const policy = new ApprovalPolicy();
				policy.description = name;
				policy.name = name;
				policy.tenant = tenant;
				policy.organizationId = org.id;
				policy.approvalType = name.replace(/\s+/g, '_').toUpperCase();
				policies.push(policy);
			});
		});
	}
	await connection
		.createQueryBuilder()
		.insert()
		.into(ApprovalPolicy)
		.values(policies)
		.execute();

	return policies;
};
