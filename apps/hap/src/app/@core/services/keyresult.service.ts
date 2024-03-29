import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { IKeyResult } from '@hap/models';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, first } from 'rxjs/operators';
import { NbToastrService } from '@nebular/theme';

interface IKeyResultResponse {
	items: IKeyResult[];
	count: number;
}

@Injectable({
	providedIn: 'root'
})
export class KeyResultService {
	private readonly API_URL = '/api/key-results';
	constructor(
		private _http: HttpClient,
		private toastrService: NbToastrService
	) {}

	createKeyResult(keyResult): Promise<IKeyResult> {
		return this._http
			.post<IKeyResult>(`${this.API_URL}/create`, keyResult)
			.pipe(
				tap(() =>
					this.toastrService.primary('Key Result Created', 'Success')
				),
				catchError((error) => this.errorHandler(error))
			)
			.toPromise();
	}

	createBulkKeyResult(keyResults): Promise<IKeyResult[]> {
		return this._http
			.post<IKeyResult[]>(`${this.API_URL}/createBulk`, keyResults)
			.pipe(
				tap(() =>
					this.toastrService.primary('Key Results Created', 'Success')
				),
				catchError((error) => this.errorHandler(error))
			)
			.toPromise();
	}

	async update(id: string, keyResult: IKeyResult): Promise<IKeyResult> {
		return this._http
			.put<IKeyResult>(`${this.API_URL}/${id}`, keyResult)
			.pipe(first())
			.toPromise();
	}

	findKeyResult(id: string): Promise<IKeyResultResponse> {
		return this._http
			.get<IKeyResultResponse>(`${this.API_URL}/${id}`)
			.pipe(catchError((error) => this.errorHandler(error)))
			.toPromise();
	}

	getAllKeyResults(keyResult): Observable<IKeyResultResponse> {
		return this._http
			.get<IKeyResultResponse>(`${this.API_URL}/${keyResult}`)
			.pipe(catchError((error) => this.errorHandler(error)));
	}

	delete(id: string): Promise<any> {
		return this._http
			.delete(`${this.API_URL}/${id}`)
			.pipe(first())
			.toPromise();
	}

	errorHandler(error: HttpErrorResponse) {
		this.toastrService.danger(error.message, 'Error');
		return throwError(error.message);
	}
}
