import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '../core/crud/crud.service';
import { CandidateSource } from './candidate-source.entity';
import { ICandidateSource } from '@hap/models';

@Injectable()
export class CandidateSourceService extends CrudService<CandidateSource> {
	constructor(
		@InjectRepository(CandidateSource)
		private readonly candidateSourceRepository: Repository<CandidateSource>
	) {
		super(candidateSourceRepository);
	}
	updateBulk(updateInput: ICandidateSource[]): Promise<any> {
		updateInput.forEach(async (item) => {
			await this.candidateSourceRepository.save(item);
		});
		return;
	}
}
