import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { NbToastrService } from '@nebular/theme';
import { Observable, throwError } from 'rxjs';
import { ITask, IOrganizationSprint, IGetSprintsOptions } from '@hap/models';
import { tap, catchError, first } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { TranslationBaseComponent } from '../../@shared/language-base/translation-base.component';

interface ITaskResponse {
	items: ITask[];
	count: number;
}

@Injectable({
	providedIn: 'root'
})
export class SprintService extends TranslationBaseComponent {
	private readonly API_URL = '/api/organization-sprint';

	constructor(
		private _http: HttpClient,
		private toastrService: NbToastrService,
		public translateService: TranslateService
	) {
		super(translateService);
	}

	getAllSprints(findInput: IGetSprintsOptions = {}): Observable<any> {
		const data = JSON.stringify({
			relations: [
				// 'tasks'
				// 'project',
				// 'tags',
				// 'members',
				// 'members.user',
				// 'teams',
				// 'creator'
			],
			findInput
		});
		return this._http
			.get<any>(this.API_URL, {
				params: { data }
			})
			.pipe(catchError((error) => this.errorHandler(error)));
	}

	getById(id: string) {
		return this._http
			.get<ITask>(`${this.API_URL}/${id}`)
			.pipe(first())
			.toPromise();
	}

	createSprint(sprint: IOrganizationSprint): Observable<IOrganizationSprint> {
		return this._http.post<IOrganizationSprint>(this.API_URL, sprint).pipe(
			tap(() => {
				this.toastrService.primary(
					this.getTranslation('SPRINTS_PAGE.SPRINT_ADDED'),
					this.getTranslation('TOASTR.TITLE.SUCCESS')
				);
			}),
			catchError((error) => this.errorHandler(error))
		);
	}

	editSprint(
		sprintId: string,
		sprint: Partial<IOrganizationSprint>
	): Observable<IOrganizationSprint> {
		return this._http
			.put<IOrganizationSprint>(`${this.API_URL}/${sprintId}`, sprint)
			.pipe(
				tap(() =>
					this.toastrService.primary(
						this.getTranslation('SPRINTS_PAGE.SPRINT_UPDATED'),
						this.getTranslation('TOASTR.TITLE.SUCCESS')
					)
				),
				catchError((error) => this.errorHandler(error))
			);
	}

	deleteSprint(id: string): Observable<void> {
		return this._http.delete<void>(`${this.API_URL}/${id}`).pipe(
			tap(() =>
				this.toastrService.primary(
					this.getTranslation('SPRINTS_PAGE.SPRINT_DELETED'),
					this.getTranslation('TOASTR.TITLE.SUCCESS')
				)
			),
			catchError((error) => this.errorHandler(error))
		);
	}

	private errorHandler(error: HttpErrorResponse) {
		this.toastrService.danger(
			error.message,
			this.getTranslation('TOASTR.TITLE.ERROR')
		);

		return throwError(error.message);
	}
}
