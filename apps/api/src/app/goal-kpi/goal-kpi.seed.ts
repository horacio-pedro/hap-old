import { Connection } from 'typeorm';
import { Tenant } from '../tenant/tenant.entity';
import { IEmployee, IOrganization } from '@hap/models';
import { GoalKPI } from './goal-kpi.entity';
import * as faker from 'faker';

const goalKPIData = [
	{
		name: 'Average response time',
		description: '',
		type: 'Numerical',
		unit: 'ms',
		operator: '<=',
		currentValue: 1000,
		targetValue: 500
	},
	{
		name: '# of Priority bugs in production',
		description: '',
		type: 'Numerical',
		unit: 'bugs',
		operator: '<=',
		currentValue: 15,
		targetValue: 2
	}
];

export const createDefaultGoalKpi = async (
	connection: Connection,
	tenant: Tenant,
	organizations: IOrganization[],
	employees: IEmployee[]
): Promise<GoalKPI[]> => {
	const goalKpis: GoalKPI[] = [];

	organizations.forEach((organization: IOrganization) => {
		goalKPIData.forEach((goalKPI) => {
			const goalkpi = new GoalKPI();
			goalkpi.name = goalKPI.name;
			goalkpi.description = ' ';
			goalkpi.type = goalKPI.type;
			goalkpi.operator = goalKPI.operator;
			goalkpi.unit = goalKPI.unit;
			goalkpi.lead = faker.random.arrayElement(employees);
			goalkpi.currentValue = goalKPI.currentValue;
			goalkpi.targetValue = goalKPI.targetValue;
			goalkpi.organization = organization;
			goalkpi.tenant = tenant;
			goalKpis.push(goalkpi);
		});
	});

	await insertRandomGoalKpi(connection, goalKpis);
	return goalKpis;
};

const insertRandomGoalKpi = async (
	connection: Connection,
	goalKpis: GoalKPI[]
) => {
	await connection
		.createQueryBuilder()
		.insert()
		.into(GoalKPI)
		.values(goalKpis)
		.execute();
};
