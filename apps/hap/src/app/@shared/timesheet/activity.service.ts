import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IActivity, IGetActivitiesInput, IDailyActivity } from '@hap/models';
import { toParams } from '@hap/utils';

@Injectable({
	providedIn: 'root'
})
export class ActivityService {
	constructor(private http: HttpClient) {}

	getActivities(request: IGetActivitiesInput) {
		return this.http
			.get<IActivity[]>('/api/timesheet/activity', {
				params: toParams(request)
			})
			.toPromise();
	}

	getDailyActivities(request: IGetActivitiesInput) {
		return this.http
			.get<IDailyActivity[]>('/api/timesheet/activity/daily', {
				params: toParams(request)
			})
			.toPromise();
	}
}
