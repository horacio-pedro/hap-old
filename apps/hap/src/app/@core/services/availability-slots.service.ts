import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
	IAvailabilitySlot,
	IAvailabilitySlotsCreateInput,
	IAvailabilitySlotsFindInput
} from '@hap/models';
import { first } from 'rxjs/operators';

@Injectable()
export class AvailabilitySlotsService {
	AVAILABILITY_SLOTS_BASE_URI = '/api/availability-slots';

	constructor(private http: HttpClient) {}

	create(createInput: IAvailabilitySlotsCreateInput): Promise<any> {
		return this.http
			.post<IAvailabilitySlot>(
				this.AVAILABILITY_SLOTS_BASE_URI,
				createInput
			)
			.pipe(first())
			.toPromise();
	}

	createBulk(createInput: IAvailabilitySlotsCreateInput[]): Promise<any> {
		return this.http
			.post<IAvailabilitySlot[]>(
				this.AVAILABILITY_SLOTS_BASE_URI + '/bulk',
				createInput
			)
			.pipe(first())
			.toPromise();
	}

	getAll(
		relations?: string[],
		findInput?: IAvailabilitySlotsFindInput
	): Promise<{ items: IAvailabilitySlot[]; total: number }> {
		const data = JSON.stringify({ relations, findInput });
		return this.http
			.get<{ items: IAvailabilitySlot[]; total: number }>(
				this.AVAILABILITY_SLOTS_BASE_URI,
				{
					params: { data }
				}
			)
			.pipe(first())
			.toPromise();
	}

	update(
		id: string,
		updateInput: IAvailabilitySlotsCreateInput
	): Promise<any> {
		return this.http
			.put(`${this.AVAILABILITY_SLOTS_BASE_URI}/${id}`, updateInput)
			.pipe(first())
			.toPromise();
	}

	delete(id: string): Promise<any> {
		return this.http
			.delete(`${this.AVAILABILITY_SLOTS_BASE_URI}/${id}`)
			.pipe(first())
			.toPromise();
	}
}
