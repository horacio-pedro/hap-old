import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
	IAggregatedEmployeeStatistic,
	IAggregatedEmployeeStatisticFindInput,
	IEmployeeStatistics,
	IEmployeeStatisticsFindInput,
	IMonthAggregatedEmployeeStatisticsFindInput,
	IMonthAggregatedEmployeeStatistics,
	IEmployeeStatisticsHistoryFindInput,
	IEmployeeStatisticsHistory
} from '@hap/models';
import { Subject } from 'rxjs';
import { first } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class EmployeeStatisticsService {
	constructor(private http: HttpClient) {}
	avarageBonus$ = new Subject<number>();

	/**
	 * Gets the aggregated statistics for all employees of the organization from the start of time till now.
	 * If date is provided in findInput it will return only for the month selected.
	 */
	getAggregateStatisticsByOrganizationId(
		findInput?: IAggregatedEmployeeStatisticFindInput
	): Promise<IAggregatedEmployeeStatistic> {
		const data = JSON.stringify({ findInput });

		return this.http
			.get<IAggregatedEmployeeStatistic>(
				`/api/employee-statistics/aggregate`,
				{
					params: { data }
				}
			)
			.pipe(first())
			.toPromise();
	}

	/**
	 * Gets the statistics for the selected employee for the last 12 months.
	 * If date is provided in findInput it will return only for the month selected.
	 * @param employeeId The id of the employee.
	 * @param findInput Object containing valueDate.
	 * @returns Promise<EmployeeStatistics>
	 */
	getStatisticsByEmployeeId(
		employeeId: string,
		findInput?: IEmployeeStatisticsFindInput
	): Promise<IEmployeeStatistics> {
		const data = JSON.stringify({ findInput });

		return this.http
			.get<IEmployeeStatistics>(
				`/api/employee-statistics/months/${employeeId}`,
				{
					params: { data }
				}
			)
			.pipe(first())
			.toPromise();
	}

	/**
	 * Gets the statistics for the selected employee for the last N months.
	 * @param findInput Object containing valueDate, employeeId, Months.
	 * @returns Promise<MonthAggregatedEmployeeStatistics[]>
	 */
	getAggregatedStatisticsByEmployeeId(
		findInput: IMonthAggregatedEmployeeStatisticsFindInput
	): Promise<IMonthAggregatedEmployeeStatistics[]> {
		const data = JSON.stringify({ findInput });

		return this.http
			.get<IMonthAggregatedEmployeeStatistics[]>(
				`/api/employee-statistics/months`,
				{
					params: { data }
				}
			)
			.pipe(first())
			.toPromise();
	}

	/**
	 * Gets the statistics history for the selected employee for the last N months.
	 * @param findInput Object containing valueDate, employeeId, Months and History Type.
	 * @returns Promise<EmployeeStatisticsHistory[]
	 */
	getEmployeeStatisticsHistory(
		findInput: IEmployeeStatisticsHistoryFindInput
	): Promise<IEmployeeStatisticsHistory[]> {
		const data = JSON.stringify({ findInput });

		return this.http
			.get<IEmployeeStatisticsHistory[]>(
				`/api/employee-statistics/history`,
				{
					params: { data }
				}
			)
			.pipe(first())
			.toPromise();
	}
}
