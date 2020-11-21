import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IJobSearchOccupation, IPagination } from '@hap/models';
import { toParams } from '@hap/utils';

@Injectable({
	providedIn: 'root'
})
export class JobSearchOccupationService {
	constructor(private http: HttpClient) {}

	getAll(request?: any) {
		return this.http
			.get<IPagination<IJobSearchOccupation>>(
				`/api/job-preset/job-search-occupation`,
				{
					params: request ? toParams(request) : {}
				}
			)
			.toPromise();
	}

	create(request?: IJobSearchOccupation) {
		return this.http
			.post<IJobSearchOccupation>(
				`/api/job-preset/job-search-occupation`,
				request
			)
			.toPromise();
	}
}
