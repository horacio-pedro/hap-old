import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ICandidateLevelInput } from '@hap/models';

@Injectable({
	providedIn: 'root'
})
export class CandidateLevelService {
	constructor(private http: HttpClient) {}

	getAll(orgId: string) {
		return this.http.get(`/api/candidate-level/${orgId}`);
	}

	create(candidateLevel: ICandidateLevelInput) {
		return this.http.post('/api/candidate-level', candidateLevel);
	}

	delete(id: string) {
		return this.http.delete(`/api/candidate-level/${id}`);
	}

	update(id: string, candidateLevel: ICandidateLevelInput) {
		return this.http.put(`/api/candidate-level/${id}`, candidateLevel);
	}
}
